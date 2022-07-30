import { combineLatest, Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArrayKeyedMap, TrieNode } from './ArrayKeyedMap';
import { ArraySet } from './ArraySet';
import { BuiltIn } from './Atom';
import { Assert, AssertRetract, DeleteEntity, NewEntity, Retract } from './EavStoreLog';
import { AttributeSchema, Cardinality, Fact, IEavStore, Store, StoreSymbol } from './IEavStore';
import { IPublisher } from './IPublisher';
import { ITransaction, ITransactionManager, TransactionManager } from './ITransactionManager';

export const IsVariable = element => typeof element === 'string' && element[0] === '?';
export const IsConstant = element => !(typeof element === 'undefined' || IsVariable(element));

export interface Rule
{
    Head: [any, ...any[]],
    Body: Fact[]
}

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

export class EavStore implements IEavStore, IPublisher
{
    private _eav                = new Map<any, Map<PropertyKey, any>>();
    private _aev                = new Map<PropertyKey, Map<any, any>>();
    private _ave                : Map<PropertyKey, Map<any, any>>;
    private _entitiesSubscribers: Subscriber<Set<any>>[] = [];
    private _atomSubscribers    = new ArrayKeyedMap<Fact, Set<Subscriber<Fact[]>>>();
    private _schema             : Map<PropertyKey, AttributeSchema>;
    private _publishSuspended   = 0;
    private _publishEntities    : boolean;
    private _atomsToPublish     : Set<Fact> = new ArraySet<Fact>();
    private _transactionManager : ITransactionManager = new TransactionManager();

    private static _empty: [any, any][] = [];

    constructor(
        attributeSchema: AttributeSchema[] = [],
        private _defaultCardinality = Cardinality.Many
        )
    {
        this._schema = new Map<PropertyKey, AttributeSchema>(attributeSchema.map(attributeSchema => [attributeSchema.Name, attributeSchema]));
        this._ave = new Map<PropertyKey, Map<any, any>>(
            attributeSchema
                .filter(attributeSchema => attributeSchema.UniqueIdentity)
                .map(attributeSchema => [attributeSchema.Name, new Map<any, any>()]));
    }

    public Entities(): Set<any>
    {
        return new Set<any>(this._eav.keys());
    }

    public Attribute(
        attribute: string
        ): [any, any][]
    {
        const ev = this._aev.get(attribute);
        if(!ev)
            return EavStore._empty;

        const list: [any, any][] = [];
        for(const [entity, value] of ev)
        {
            if(value instanceof Array)
                list.push(...value.map<[any, any]>(value => [entity, value]));

            else if(typeof value !== 'undefined' && value !== null)
                list.push([entity, value]);
        }
        return list;
    }

    ObserveEntities(): Observable<Set<any>>
    {
        return new Observable<Set<any>>(
            subscriber =>
            {
                this._entitiesSubscribers.push(subscriber);
                subscriber.next(new Set<any>(this.Entities()));

                subscriber.add(
                    () =>
                    {
                        const index = this._entitiesSubscribers.indexOf(subscriber);

                        if(index != -1)
                            this._entitiesSubscribers.splice(
                                index,
                                1);
                    });
            });
    }

    Facts(
        [entity, attribute, value]: Fact
        ): Fact[]
    {
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
                        if((v instanceof Array && v.includes(value)) || v === value)
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
                        if((v instanceof Array && v.includes(value)) || v === value)
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
            const ev = this._aev.get(attribute);
            if(ev)
                for(const [e, v] of ev)
                    if(typeof value !== 'undefined')
                    {
                        if((v instanceof Array && v.includes(value)) || v === value)
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
        else for(const [e, av] of this._eav)
            for(const [a, v] of av)
                if(typeof value !== 'undefined')
                {
                    if((v instanceof Array && v.includes(value)) || v === value)
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

    Query<T extends [any, ...any[]]>(
        head   : T,
        ...body: (Fact | BuiltIn)[]): { [K in keyof T]: any; }[]
    {
        return body.reduce(
            (substitutions, atom) =>
            {
                if(typeof atom === 'function')
                    return [...atom(substitutions)];

                let count = substitutions.length;
                while(count--)
                {
                    const substitution = substitutions.shift();
                    // Substitute known variables.
                    for(const fact of this.Facts(<Fact>atom.map(term => IsVariable(term) ? substitution[term] : term)))
                    {
                        let merged = { ...substitution };
                        for(let index = 0; index < atom.length && merged; ++index)
                        {
                            const term = atom[index];
                            if(IsVariable(term))
                            {
                                if(typeof merged[term] === 'undefined')
                                    merged[term] = fact[index];

                                else if(merged[term] !== fact[index])
                                    // Fact does not match query pattern.
                                    merged = null;
                            }
                        }

                        if(merged)
                            substitutions.push(merged);
                    }
                }

                return substitutions;
            },
            [{}]).map(substitution => <{ [K in keyof T]: any; }>head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
    }

    ObserveAtom(
        atom: Fact
        ): Observable<Fact[]>
    {
        atom = <Fact>atom.map(term => IsVariable(term) ? undefined : term);
        return new Observable<Fact[]>(
            subscriber =>
            {
                let subscribers = this._atomSubscribers.get(atom);
                if(!subscribers)
                {
                    subscribers = new Set<Subscriber<Fact[]>>();
                    this._atomSubscribers.set(
                        atom,
                        subscribers);
                }

                subscribers.add(subscriber);

                subscriber.add(
                    () =>
                    {
                        subscribers.delete(subscriber);
                        if(!subscribers.size)
                            this._atomSubscribers.delete(atom);
                    });

                subscriber.next(this.Facts(atom));
            });
    }

    ObserveAttribute(
        attribute: PropertyKey
        ): Observable<[any, any][]>
    {
        return this.ObserveAtom([undefined, attribute, undefined]).pipe(map(facts => facts.map(([entity, , value]) => [entity, value])));
    }

    Observe<T extends [any, ...any[]]>(
        head: T,
        ...body: (Fact | BuiltIn)[]): Observable<{ [K in keyof T]: any; }[]>
    {
        return combineLatest(
            body.filter(atom => atom instanceof Array).map(atom => this.ObserveAtom(<Fact>atom)),
            (...observed) =>
            {
                let observedIndex = 0;
                return body.reduce(
                    (substitutions, atom) =>
                    {
                        if(typeof atom === 'function')
                            return [...atom(substitutions)];

                        let count = substitutions.length;
                        while(count--)
                        {
                            const substitution = substitutions.shift();
                            for(const fact of observed[observedIndex])
                            {
                                let merged = { ...substitution };
                                for(let index = 0; index < atom.length && merged; ++index)
                                {
                                    const term = atom[index];
                                    if(IsVariable(term))
                                    {
                                        if(typeof merged[term] === 'undefined')
                                            merged[term] = fact[index];

                                        else if(merged[term] !== fact[index])
                                            // Fact does not match query pattern.
                                            merged = null;
                                    }
                                }

                                if(merged)
                                    substitutions.push(merged);
                            }
                        }

                        ++observedIndex;
                        return substitutions;
                    },
                    [{}]).map(substitution => <{ [K in keyof T]: any; }>head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
            });
    }

    NewEntity(): any
    {
        const av = new Map<PropertyKey, any>();
        const entity = EntityProxyFactory(
            this,
            av,
            this._aev,
            this._ave);
        this._eav.set(
            entity,
            av);

        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new NewEntity(
                    entity,
                    () => this.DeleteEntity(entity)));

        entity[StoreSymbol] = this;

        this.PublishEntities();
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
                            this.PublishEntities();
                        }));

            this.PublishEntities();
            this.UnsuspendPublish();
        }
    }

    //Assert(
    //    entity   : any,
    //    attribute: PropertyKey,
    //    value    : any
    //    ): void
    //{
    //    let currentValue = entity[attribute];

    //    if(typeof currentValue === 'undefined' && this.Cardinality(attribute) === Cardinality.Many)
    //        currentValue = entity[attribute] = ArrayProxyFactory(
    //            this,
    //            entity,
    //            attribute,
    //            []);

    //    if(currentValue instanceof Array)
    //        currentValue.push(value);

    //    else
    //        entity[attribute] = value;

    //}

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
            previousValue[TargetSymbol].push(value);
            this.PublishAssert(
                entity,
                attribute,
                value);
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

        if(Store(object) === this)
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

                else if(entity != ve[object[attribute]])
                    throw 'Unique Identity Conflict';
            });

        const toPrimitive = object[Symbol.toPrimitive];
        if(!entity)
        {
            entity = this.NewEntity();
            entity[Symbol.toPrimitive] = toPrimitive || (() => 'Proxy');
            added.set(
                object,
                entity);
        }
        else if(toPrimitive)
            entity[Symbol.toPrimitive] = toPrimitive;

        for(const key in object)
        {
            let value = object[key];
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

    PublishEntities()
    {
        if(this._publishSuspended)
        {
            this._publishEntities = true;
            return;
        }

        if(this._entitiesSubscribers.length)
        {
            const entities = this.Entities();
            this._entitiesSubscribers.forEach(subscriber => subscriber.next(entities));
        }
    }

    PublishAtom(
        atom        : Fact,
        subscribers?: Set<Subscriber<Fact[]>>
        )
    {
        if(this._publishSuspended)
        {
            this._atomsToPublish.add(atom);
            return;
        };

        subscribers = subscribers || this._atomSubscribers.get(atom);

        if(subscribers)
            subscribers.forEach(subscriber => subscriber.next(this.Facts(atom)));
    }

    SuspendPublish(): void
    {
        if(!this._publishSuspended)
        {
            this._publishEntities = false;
            this._atomsToPublish.clear();
        }
        ++this._publishSuspended;
    }

    UnsuspendPublish(): void
    {
        --this._publishSuspended;
        if(!this._publishSuspended)
        {
            if(this._publishEntities)
                this.PublishEntities();

            this._atomsToPublish.forEach(atom => this.PublishAtom(atom));
        }
    }

    PublishAssert(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new Assert(
                    entity,
                    attribute,
                    value));

        Match(
            this._atomSubscribers,
            [entity, attribute, value],
            (atom, subscribers: Set<Subscriber<Fact[]>>) => this.PublishAtom(atom, subscribers));
    }

    PublishRetract(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new Retract(
                    entity,
                    attribute,
                    value));

        Match(
            this._atomSubscribers,
            [entity, attribute, value],
            (atom, subscribers: Set<Subscriber<Fact[]>>) => this.PublishAtom(atom, subscribers));
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
            this._atomSubscribers,
            [entity, attribute, assertedValue],
            (atom, subscribers: Set<Subscriber<Fact[]>>) => this.PublishAtom(atom, subscribers));
        Match(
            this._atomSubscribers,
            [entity, attribute, retractedValue],
            (atom, subscribers: Set<Subscriber<Fact[]>>) => this.PublishAtom(atom, subscribers));
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

function ToPrimitive(
    hint
    )
{
    return 'Proxy';
}


function EntityProxyFactory(
    publisher: IPublisher,
    av       : Map<PropertyKey, any>,
    aev      : Map<PropertyKey, Map<any, any>>,
    ave      : Map<PropertyKey, Map<any, any>>
    ): object
{
    let handler: ProxyHandler<object> = {
        get: function(
            target,
            p
            ): any
        {
            if(p === Symbol.toPrimitive)
                return av.get(p) || ToPrimitive;
            return av.get(p);
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
        {},
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
            const methodHandler = methodHandlers.get(p);
            if(methodHandler)
                return methodHandler;

            return target[p];
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
