import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArrayKeyedMap, TrieNode } from '../Collections/ArrayKeyedMap';
import { SortedSet } from '../Collections/SortedSet';
import { WrapperType } from '../Ontology/Wrapped';
import { IScheduler, Scheduler, Signal } from '../Signal/Signal';
import { IsVariable } from './Datalog';
import { DatalogObservableInterpreter } from './DatalogObservableInterpreter';
import { Query } from './DatalogQuery';
import { DatalogSignalInterpreter } from './DatalogSignalInterpreter1';
import { Assert, AssertRetract, DeleteEntity, NewEntity, Retract } from './EavStoreLog';
import { IDatalogInterpreter } from './IDatalogInterpreter';
import { AttributeSchema, Cardinality, Fact, IEavStore, PropertyKey, StoreSymbol } from './IEavStore';
import { IPublisher } from './IPublisher';
import { ITransaction, ITransactionManager, TransactionManager } from './ITransactionManager';
import { TupleCompareFactory } from './Tuple';

export const EntityId = Symbol('EntityId');

export const TypeCollation = {
    'undefined': 0,
    'object'   : 1,
    'bigint'   : 2,
    'boolean'  : 3,
    'function' : 4,
    'number'   : 5,
    'string'   : 6,
    'symbol'   : 7
};

export function Compare(
    a: any,
    b: any
    ): number
{
    if(a === b)
        return 0;

    const aType = typeof a;
    const bType = typeof b;

    if(aType !== bType)
        return TypeCollation[aType] - TypeCollation[bType];

    if(aType === 'object')
    {
        if(a !== null && b !== null)
        {
            const aId = a[EntityId];
            if(typeof aId === 'number')
            {
                const bId = b[EntityId];
                if(typeof bId === 'number')
                    return aId - bId;
            }
        }

        return a - b;
    }

    return a < b ? -1 : 1;
}

export const tupleCompare = TupleCompareFactory(Compare);

function Match<TTrieNode extends TrieNode<TTrieNode, V>, V>(
    trieNode: TTrieNode,
    fact    : Fact,
    callback: (atom: Fact, value: V) => void,
    atom    = []
    )
{
    if(atom.length === fact.length)
    {
        callback(
            <Fact>atom,
            trieNode.value);
        return;
    }

    let child = trieNode.children.get(fact[atom.length]);
    if(child)
        Match(
            child,
            fact,
            callback,
            [...atom, fact[atom.length]]);

    if(fact[atom.length] !== undefined)
    {
        child = trieNode.children.get(undefined);
        if(child)
            Match(
                child,
                fact,
                callback,
                [...atom, undefined]);
    }
}

class Topic<TId = any, T = any>
{
    readonly Subscribers = new Set<(t: T) => void>();

    constructor(
        public readonly Id          : TId,
        public readonly Publisher   : () => T
        )
    {
    }

    Publish()
    {
        let published = this.Publisher();
        this.Subscribers.forEach(subscriber => subscriber(published))
    }
}

const EntitiesTopicId = [];

export class EavStore implements IEavStore, IPublisher
{
    private _eav                         = new Map<any, Map<PropertyKey, any>>();
    private _aev                         = new Map<PropertyKey, Map<any, any>>();
    private _ave                         : Map<PropertyKey, Map<any, any>>;
    private _nextEntityId                = 1
    private _entitiesObservable          : BehaviorSubject<Set<any>>;
    private _entitiesSignal              : Signal<Set<any>>;
    private _atomTopics                  = new ArrayKeyedMap<Fact, Topic<Fact, Fact[]>>();
    private _entitiesTopic               : Topic<any, Set<any>>;
    private _scheduledTopics             = new SortedSet<Topic>((a, b) => tupleCompare(a.Id, b.Id));
    private _schema                      : Map<PropertyKey, AttributeSchema>;
    private _publishSuspended            = 0;
    private _transactionManager          : ITransactionManager = new TransactionManager();
    private _datalogSignalInterpreter    : IDatalogInterpreter<WrapperType.Signal>;
    private _datalogObservableInterpreter: IDatalogInterpreter<WrapperType.Observable>;

    readonly SignalScheduler: IScheduler = new Scheduler();

    constructor(
        attributeSchema: AttributeSchema[] = [],
        private _defaultCardinality = Cardinality.Many
        )
    {
        attributeSchema = attributeSchema.concat(
            [
                {
                    Name: Symbol.toPrimitive,
                    Cardinality: Cardinality.One
                },
                {
                    Name: EntityId,
                    Cardinality: Cardinality.One
                },
                {
                    Name: StoreSymbol,
                    Cardinality: Cardinality.One
                }
            ]);
        this._schema = new Map<PropertyKey, AttributeSchema>(attributeSchema.map(attributeSchema => [attributeSchema.Name, attributeSchema]));
        this._ave = new Map<PropertyKey, Map<any, any>>(
            attributeSchema
                .filter(attributeSchema => attributeSchema.UniqueIdentity)
                .map(attributeSchema => [attributeSchema.Name, new Map<any, any>()]));

        this._datalogSignalInterpreter = new DatalogSignalInterpreter(
            this,
            tupleCompare);

        this._datalogObservableInterpreter = new DatalogObservableInterpreter(this);

        this._entitiesTopic = new Topic(
            EntitiesTopicId,
            () => this.Entities());
    }

    public Entities(): Set<any>
    {
        return new Set<any>(this._eav.keys());
    }

    ObserveEntities(): Observable<Set<any>>
    {
        if(!this._entitiesObservable)
        {
            this._entitiesObservable = new BehaviorSubject<Set<any>>(this.Entities());
            this._entitiesTopic.Subscribers.add(entities => this._entitiesObservable.next(entities))
        }
        return this._entitiesObservable;
    }

    SignalEntities(): Signal<Set<any>, any[]>
    {
        if(!this._entitiesSignal)
        {
            this._entitiesSignal = this.SignalScheduler.AddSignal(() => this.Entities());

            const subscriber = (entities: Set<any>) => this.SignalScheduler.Inject(
                this._entitiesSignal,
                entities);

            this._entitiesTopic.Subscribers.add(subscriber);
            this._entitiesSignal.AddRemoveAction(
                () =>
                {
                    this._entitiesTopic.Subscribers.delete(subscriber);
                    this._entitiesSignal = null;
                });
        }
        return this._entitiesSignal;
    }

    private QueryAtom(
        atom: Fact
        ): Fact[]
    {
        const [entity, attribute, value] = atom.map(term => IsVariable(term) ? undefined : term);
        const facts: Fact[] = [];
        if(typeof entity !== 'undefined')
        {
            const av = this._eav.get(entity)
            if(av)
                if(typeof attribute !== 'undefined')
                {
                    const v = av.get(attribute);
                    if(typeof value !== 'undefined')
                    {
                        if(v instanceof Array)
                            facts.push(...v.filter(v => v === value).map<Fact>(v => [entity, attribute, value]));

                        else if(v === value)
                            facts.push([entity, attribute, value]);
                    }
                    else
                    {
                        if(v instanceof Array)
                            facts.push(...v.map<Fact>(v => [entity, attribute, v]));

                        else if(typeof v !== 'undefined' && v !== null)
                            facts.push([entity, attribute, v]);
                    }
                }
                else for(const [a, v] of av)
                    if(typeof value !== 'undefined')
                    {
                        if(v instanceof Array)
                            facts.push(...v.filter(v => v === value).map<Fact>(v => [entity, a, value]));

                        else if(v === value)
                            facts.push([entity, a, value]);
                    }
                    else
                    {
                        if(v instanceof Array)
                            facts.push(...v.map<Fact>(v => [entity, a, v]));

                        else if(typeof v !== 'undefined' && v !== null)
                            facts.push([entity, a, v]);
                    }
        }
        else if(typeof attribute !== 'undefined')
        {
            let ve: Map<any, any>;
            if(typeof value !== 'undefined')
                ve = this._ave.get(attribute);

            if(ve)
            {
                const e = ve.get(value);
                if(e instanceof Array)
                    facts.push(...e.map<Fact>(e => [e, attribute, value]));

                else if(typeof e !== 'undefined')
                    facts.push([e, attribute, value]);
            }
            else
            {
                const ev = this._aev.get(attribute);
                if(ev)
                    for(const [e, v] of ev)
                        if(typeof value !== 'undefined')
                        {
                            if(v instanceof Array)
                                facts.push(...v.filter(v => v === value).map<Fact>(v => ([e, attribute, value])));

                            else if(v === value)
                                facts.push([e, attribute, value]);
                        }
                        else
                        {
                            if(v instanceof Array)
                                facts.push(...v.map<Fact>(v => [e, attribute, v]));

                            else if(typeof v !== 'undefined' && v !== null)
                                facts.push([e, attribute, v]);
                        }
            }
        }
        else for(const [e, av] of this._eav)
            for(const [a, v] of av)
                if(typeof value !== 'undefined')
                {
                    if(v instanceof Array)
                        facts.push(...v.filter(v => v === value).map<Fact>(v => [e, a, value]));
                        
                    else if(v === value)
                        facts.push([e, a, value]);
                }
                else
                {
                    if(v instanceof Array)
                        facts.push(...v.map<Fact>(v => [e, a, v]));

                    else if(typeof v !== 'undefined' && v !== null)
                        facts.push([e, a, v]);
                }

        return facts;
    }

    Query(
        ...params
        ): any
    {
        return params.length === 1 ?
            this.QueryAtom(<Fact>params[0]) :
            Query(
                this,
                params[0],
                params[1],
                ...params.slice(2));
    }

    private ObserveAtom(
        atom: Fact
        ): Observable<Fact[]>
    {
        atom = <Fact>atom.map(term => IsVariable(term) ? undefined : term);
        return new Observable<Fact[]>(
            subscriber =>
            {
                let topic = this._atomTopics.get(atom);
                if(!topic)
                {
                    topic = new Topic(
                        atom,
                        () => this.QueryAtom(atom));

                    this._atomTopics.set(
                        atom,
                        topic);
                }

                let topicSubscriber = (facts: Fact[]) => subscriber.next(facts);
                topic.Subscribers.add(topicSubscriber);

                subscriber.add(
                    () =>
                    {
                        topic.Subscribers.delete(topicSubscriber);
                        if(!topic.Subscribers.size)
                            this._atomTopics.delete(topic.Id);
                    });

                topicSubscriber(topic.Publisher());
            });
    }

    Observe(
        ...params
        ): any
    {
        if(params.length === 1)
            return params[0] instanceof Array ?
                this.ObserveAtom(<Fact>params[0]) :
                this.ObserveAtom([undefined, <PropertyKey>params[0], undefined]).pipe(map(facts => facts.map(([entity, , value]) => [entity, value])));

        return this._datalogObservableInterpreter.Query(
            params[0],
            params[1],
            ...params.slice(2));
    }

    private SignalAtom(
        atom: Fact
        ): Signal<Fact[]>
    {
        atom = <Fact>atom.map(term => IsVariable(term) ? undefined : term);

        let topic = this._atomTopics.get(atom);
        if(!topic)
        {
            topic = new Topic(
                atom,
                () => this.QueryAtom(atom));

            this._atomTopics.set(
                atom,
                topic);
        }

        const signal = this.SignalScheduler.AddSignal();
        let topicSubscriber = (facts: Fact[]) => this.SignalScheduler.Inject(
            signal,
            facts);
        topic.Subscribers.add(topicSubscriber);

        signal.AddRemoveAction(
            () =>
            {
                topic.Subscribers.delete(topicSubscriber);
                if(!topic.Subscribers.size)
                    this._atomTopics.delete(topic.Id);
            });

        topicSubscriber(topic.Publisher());
        return signal;
    }

    Signal(
        ...params
        ): any
    {
        if(params.length === 1)
            return params[0] instanceof Array ?
                this.SignalAtom(<Fact>params[0]) :
                this.SignalScheduler.AddSignal(
                    (facts: Fact[]) => facts.map(([entity, , value]) => [entity, value]),
                    [this.SignalAtom([undefined, <PropertyKey>params[0], undefined])]);

        return this._datalogSignalInterpreter.Query(
            params[0],
            params[1],
            ...params.slice(2));
    }

    NewEntity(
        target?: object
        ): any
    {
        const av = new Map<PropertyKey, any>();
        const entity = EntityProxyFactory(
            this,
            av,
            this._aev,
            this._ave,
            target);
        this._eav.set(
            entity,
            av);

        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new NewEntity(
                    entity,
                    () => this.DeleteEntity(entity)));

        entity[StoreSymbol] = this;
        entity[EntityId   ] = this._nextEntityId++;

        this.Publish(this._entitiesTopic);
        return entity;
    }

    DeleteEntity(
        entity: any
        ): void
    {
        const av = this._eav.get(entity);
        if(av)
        {
            this.SuspendPublish();
            for(const [attribute, value] of av)
            {
                av.delete(attribute);

                const ev = this._aev.get(attribute);
                ev.delete(entity);
                if(!ev.size)
                    this._aev.delete(attribute);

                const ve = this._ave.get(attribute);
                if(ve)
                    ve.delete(value);

                if(value instanceof Array)
                    value.forEach(
                        value => this.PublishRetract(
                            entity,
                            attribute,
                            value));

                else
                    this.PublishRetract(
                        entity,
                        attribute,
                        value);
            }

            this._eav.delete(entity);

            if(this._transactionManager.Active)
                this._transactionManager.Log(
                    new DeleteEntity(
                        entity,
                        () =>
                        {
                            this._eav.set(
                                entity,
                                av);
                            entity[StoreSymbol] = this;
                            this.Publish(this._entitiesTopic);
                        }));

            this.Publish(this._entitiesTopic);
            this.UnsuspendPublish();
        }
    }

    Assert(
        entity   : any,
        attribute: PropertyKey,
        value    : any): void;
    Assert(object: object): any;
    Assert(
        entity    : any,
        attribute?: PropertyKey,
        value    ?: any
        ): void
    {
        if(typeof attribute === 'undefined')
            try
            {
                this.SuspendPublish();
                const added = new Map<object, any>();
                return this.AddObject(
                    entity,
                    added);
            }
            finally
            {
                this.UnsuspendPublish();
            }

        const av = this._eav.get(entity);
        let ev = this._aev.get(attribute);
        let previousValue = av.get(attribute);

        if(previousValue === undefined && this.Cardinality(attribute) === Cardinality.Many)
        {
            previousValue = ArrayProxyFactory(
                this,
                entity,
                attribute,
                []);

            av.set(
                attribute,
                previousValue);

            if(!ev)
            {
                ev = new Map<any, any>();
                this._aev.set(
                    attribute,
                    ev);
            }

            ev.set(
                entity,
                previousValue);
        }

        if(previousValue instanceof Array)
        {
            if(!previousValue.includes(value))
            {
                previousValue[TargetSymbol].push(value);
                this.PublishAssert(
                    entity,
                    attribute,
                    value);
            }
        }
        else
        {
            const implicitRetract = previousValue !== undefined || av.has(attribute);
            const ve = this._ave.get(attribute);
            if(ve)
            {
                if(typeof ve.get(value) !== 'undefined')
                    // Value already in use for attribute.
                    throw 'Unique Identity Conflict';

                ve.delete(previousValue);
                ve.set(
                    value,
                    entity);
            }

            av.set(
                attribute,
                value);

            if(!ev)
            {
                ev = new Map<any, any>();
                this._aev.set(
                    attribute,
                    ev);
            }

            ev.set(
                entity,
                value);

            if(!implicitRetract)
                this.PublishAssert(
                    entity,
                    attribute,
                    value);

            else
                this.PublishAssertRetract(
                    entity,
                    attribute,
                    value,
                    previousValue);
        }
    }

    Retract(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        const av = this._eav.get(entity);
        let previousValue = av.get(attribute);

        if(previousValue instanceof Array)
        {
            const index = previousValue.indexOf(value);

            if(index === -1)
                throw 'Unknown fact.';

            previousValue[TargetSymbol].splice(
                index,
                1);
        }
        else if(previousValue !== value)
            throw 'Unknown fact.';

        else
        {
            av.delete(attribute);

            const ev = this._aev.get(attribute);
            ev.delete(entity);
            if(!ev.size)
                this._aev.delete(attribute);

            const ve = this._ave.get(attribute);
            if(ve)
                ve.delete(value);
        }

        this.PublishRetract(
            entity,
            attribute,
            value);
    }

    Clear(): void
    {
        this._eav.clear();
        this._aev.clear();

        for(const ve of this._ave.values())
            ve.clear();
    }

    private AddObject(
        object: object,
        added : Map<object, any>
        ): any
    {
        if(typeof object !== 'object' ||
            object === null ||
            object instanceof Date)
            return object;

        if(this._eav.has(object))
            return object;

        let entity = added.get(object);
        if(entity)
            return entity;

        [...this._ave]
            .filter(([attribute,]) => attribute in object)
            .forEach(([attribute,ve]) =>
            {
                if(typeof entity === 'undefined')
                    entity = ve.get(object[attribute]);

                else if(entity != ve.get(object[attribute]))
                    throw 'Unique Identity Conflict';
            });

        if(!entity)
            entity = this.NewEntity(object);

        added.set(
            object,
            entity);

        for(const key of Reflect.ownKeys(object)) // Include Symbol keys.
        {
            const value = object[key];
            if(value instanceof Array)
            {
                if(!entity[key])
                    entity[key] = ArrayProxyFactory(
                        this,
                        entity,
                        key,
                        []);

                entity[key].push(...value
                    .map(element => this.AddObject(
                        element,
                        added))
                    .filter(element => !entity[key].includes(element)));
            }
            else
                entity[key] = this.AddObject(
                    value,
                    added);
        }

        return entity;
    }

    Publish(
        topic: Topic
        )
    {
        if(this._publishSuspended)
        {
            this._scheduledTopics.add(topic);
            return;
        };

        topic.Publish();
    }

    SuspendPublish(): void
    {
        ++this._publishSuspended;
    }

    UnsuspendPublish(): void
    {
        --this._publishSuspended;
        if(!this._publishSuspended)
        {
            try
            {
                this.SignalScheduler.Suspend();
                while(this._scheduledTopics.size)
                    this._scheduledTopics.shift().Publish();
            }
            finally
            {
                this.SignalScheduler.Resume();
            }
        }
    }

    PublishAssert(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        this.Cardinality(attribute);

        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new Assert(
                    entity,
                    attribute,
                    value));

        Match(
            this._atomTopics,
            [entity, attribute, value],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
    }

    PublishRetract(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        this.Cardinality(attribute);

        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new Retract(
                    entity,
                    attribute,
                    value));

        Match(
            this._atomTopics,
            [entity, attribute, value],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
    }

    PublishAssertRetract(
        entity        : any,
        attribute     : PropertyKey,
        assertedValue : any,
        retractedValue: any
        ): void
    {
        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new AssertRetract(
                    entity,
                    attribute,
                    assertedValue,
                    retractedValue));

        this.SuspendPublish();
        Match(
            this._atomTopics,
            [entity, attribute, assertedValue],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
        Match(
            this._atomTopics,
            [entity, attribute, retractedValue],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
        this.UnsuspendPublish();
    }

    BeginTransaction(): ITransaction
    {
        return this._transactionManager.BeginTransaction();
    }

    private Cardinality(
        attribute: PropertyKey
        ): Cardinality
    {
        const attributeSchema = this._schema.get(attribute);
        if(attributeSchema && typeof attributeSchema.Cardinality !== 'undefined')
            return attributeSchema.Cardinality;

        console.warn(`No schema for attribute: ${String(attribute)}`);
        return this._defaultCardinality;
    }
}

function EntityProxyFactory(
    publisher: IPublisher,
    av       : Map<PropertyKey, any>,
    aev      : Map<PropertyKey, Map<any, any>>,
    ave      : Map<PropertyKey, Map<any, any>>,
    target   : object = {}
    ): object
{
    let handler: ProxyHandler<object> = {
        get: function(
            target,
            p
            ): any
        {
            const value = av.get(p);
            return typeof value === 'undefined' ? Reflect.getPrototypeOf(target)[p] : value;
        },
        getOwnPropertyDescriptor: function(
            target,
            key
            ): PropertyDescriptor
        {
            return {
                value       : av.get(key),
                configurable: true,
                enumerable  : true
            };
        },
        has: function(
            target,
            p
            ): boolean
        {
            return av.has(p);
        },
        ownKeys: function(): PropertyKey[]
        {
            return [...av.keys()];
        },
        set: function(
            target,
            p,
            value,
            receiver
            ): boolean
        {
            const previousValue = av.get(p);
            if(previousValue === value)
                return true;

            const implicitRetract = previousValue !== undefined || av.has(p);

            const ve = ave.get(p);
            if(ve)
            {
                if(typeof ve.get(value) !== 'undefined')
                    // Value already in use for attribute.
                    throw 'Unique Identity Conflict';

                ve.delete(previousValue);
                ve.set(
                    value,
                    receiver);
            }

            av.set(
                p,
                value);

            let ev = aev.get(p);
            if(!ev)
            {
                ev = new Map<any, any>();
                aev.set(
                    p,
                    ev);
            }

            ev.set(
                receiver,
                value);

            if(!(value instanceof Array))
                if(!implicitRetract)
                    publisher.PublishAssert(
                        receiver,
                        p,
                        value);

                else
                    publisher.PublishAssertRetract(
                        receiver,
                        p,
                        value,
                        previousValue);

            return true;
        }
    };

    return new Proxy(
        target, // Use target for prototype.
        handler);
}

function ArrayMethodHandlerFactory(
    publisher  : IPublisher,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result = targetMethod.call(
                    targetArray,
                    ...argArray);
                //if(publisher)
                //    publisher.PublishAttribute(attribute);
                return result;
            }
        };
}

function PushUnshiftMethodHandlerFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result = targetMethod.call(
                    targetArray,
                    ...argArray);

                publisher.SuspendPublish();
                [...argArray].forEach(
                    value => publisher.PublishAssert(
                        entity,
                        attribute,
                        value));
                publisher.UnsuspendPublish();

                return result;
            }
        };
}

function PopShiftMethodHandlerFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result = targetMethod.call(
                    targetArray,
                    ...argArray);
                if(typeof result !== 'undefined')
                    publisher.PublishRetract(
                        entity,
                        attribute,
                        result);
                return result;
            }
        };
}

function SpliceMethodHandlerFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result: any[] = targetMethod.call(
                    targetArray,
                    ...argArray);

                publisher.SuspendPublish();
                result.forEach(
                    retracted => publisher.PublishRetract(
                        entity,
                        attribute,
                        retracted));
                [...argArray].slice(2).forEach(
                    asserted => publisher.PublishAssert(
                        entity,
                        attribute,
                        asserted));
                publisher.UnsuspendPublish();

                return result;
            }
        };
}

function methodHandlersFactory2(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): Map<PropertyKey, any>
{
    const methodHandler = ArrayMethodHandlerFactory(
        publisher,
        attribute,
        targetArray);

    return new Map(
        [
            'push',
            'pop',
            'shift',
            'unshift',
            'splice'
        ].map(methodName => [methodName, new Proxy(
            Array.prototype[methodName],
            methodHandler)]));
}

export const TargetSymbol = Symbol('Target');

function methodHandlersFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): Map<PropertyKey, ProxyHandler<{ (...args): any }>>
{
    const pushUnshiftMethodHandler = PushUnshiftMethodHandlerFactory(publisher, entity, attribute, targetArray);
    const popShiftMethodHandler    = PopShiftMethodHandlerFactory   (publisher, entity, attribute, targetArray);
    const spliceMethodHandler      = SpliceMethodHandlerFactory     (publisher, entity, attribute, targetArray);
    return new Map<PropertyKey, any>(
        [
            ['push'      , new Proxy(Array.prototype['push'   ], pushUnshiftMethodHandler)],
            ['pop'       , new Proxy(Array.prototype['pop'    ], popShiftMethodHandler   )],
            ['shift'     , new Proxy(Array.prototype['shift'  ], popShiftMethodHandler   )],
            ['unshift'   , new Proxy(Array.prototype['unshift'], pushUnshiftMethodHandler)],
            ['splice'    , new Proxy(Array.prototype['splice' ], spliceMethodHandler     )],
            [TargetSymbol, targetArray                                                    ]
        ]);
}

export function ArrayProxyFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    )
{
    const methodHandlers = methodHandlersFactory(
        publisher,
        entity,
        attribute,
        targetArray);

    const handler: ProxyHandler<[]> = {
        get: function(
            target,
            p
            ): any
        {
            return methodHandlers.get(p) || target[p];
        },
        set: function(
            target,
            p,
            value
            ): boolean
        {
            const previousValue = target[p];
            target[p] = value;
            publisher.PublishAssertRetract(
                entity,
                attribute,
                value,
                previousValue);
            return true;
        }
    };

    return new Proxy(
        targetArray,
        handler);
}
