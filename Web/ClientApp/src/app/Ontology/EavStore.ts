import { combineLatest, Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArrayKeyedMap, TrieNode } from './ArrayKeyedMap';
import { ArraySet } from './ArraySet';
import { AttributeSchema, Cardinality, Fact, IEavStore, StoreSymbol } from './IEavStore';

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
    callback: (atom: Fact) => void,
    atom    = []
    )
{
    if(atom.length === fact.length)
    {
        callback(<Fact>atom);
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

export class EavStore implements IEavStore
{
    private _eav                = new Map<any, Map<PropertyKey, any>>();
    private _aev                = new Map<PropertyKey, Map<any, any>>();
    private _ave                : Map<PropertyKey, Map<any, any>>;
    private _entitiesSubscribers: Subscriber<Set<any>>[] = [];
    private _atomSubscribers    = new ArrayKeyedMap<Fact, Set<Subscriber<Fact[]>>>();
    private _schema             : Map<string, AttributeSchema>;
    private _publishSuspended   = 0;
    private _publishEntities    : boolean;
    private _atomsToPublish     : Set<Fact> = new ArraySet<Fact>();

    private static _empty: [any, any][] = [];

    constructor(
        ...attributeSchema: AttributeSchema[]
        )
    {
        this._schema = new Map<string, AttributeSchema>(attributeSchema.map(attributeSchema => [attributeSchema.Name, attributeSchema]));
        this._ave = new Map<string, Map<any, any>>(
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

    ObserveAttribute(
        attribute: string
        ): Observable<[any, any][]>
    {
        return this.ObserveAtom([undefined, attribute, undefined]).pipe(map(facts => facts.map(([entity,,value]) =>[entity, value])));
    }

    Facts(
        [entity, attribute, value]: Fact
        ): Fact[]
    {
        const facts: Fact[] = [];
        if(IsConstant(entity))
        {
            const av = this._eav.get(entity)
            if(av)
                if(IsConstant(attribute))
                {
                    const value = av.get(attribute);
                    if(value instanceof Array)
                        facts.push(...value.map<Fact>(value => [entity, attribute, value]));

                    else if(typeof value !== 'undefined' && value !== null)
                        facts.push([entity, attribute, value]);
                }
                else for(const [attribute, value] of av)
                {
                    if(value instanceof Array)
                        facts.push(...value.map<Fact>(value => [entity, attribute, value]));

                    else if(typeof value !== 'undefined' && value !== null)
                        facts.push([entity, attribute, value]);
                }
        }
        else if(IsConstant(attribute))
        {
            const ev = this._aev.get(attribute);
            if(ev)
            {
                for(const [entity, value] of ev)
                {
                    if(value instanceof Array)
                        facts.push(...value.map<Fact>(value => [entity, attribute, value]));

                    else if(typeof value !== 'undefined' && value !== null)
                        facts.push([entity, attribute, value]);
                }
            }
        }
        else for(const [entity, av] of this._eav)
            for(const [attribute, value] of av)
            {
                if(value instanceof Array)
                    facts.push(...value.map<Fact>(value => [entity, attribute, value]));

                else if(typeof value !== 'undefined' && value !== null)
                    facts.push([entity, attribute, value]);
            }

        return IsConstant(value) ? facts.filter(fact => fact[2] === value) : facts;
    }

    Query<T extends [any, ...any[]]>(
        head   : T,
        ...body: Fact[]): { [K in keyof T]: any; }[]
    {
        return body.reduce(
            (substitutions, atom) =>
            {
                let count = substitutions.length;
                while(count--)
                {
                    const substitution = substitutions.shift();
                    // Substitute known variables.
                    const updatedAtom = <Fact>atom.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term);
                    for(const fact of this.Facts(updatedAtom))
                    {
                        const combined = updatedAtom.reduce(
                            (substitution, term, termIndex) =>
                            {
                                if(!substitution)
                                    return substitution;

                                if(IsVariable(term))
                                {
                                    if(typeof substitution[term] === 'undefined')
                                        substitution[term] = fact[termIndex];

                                    else if(substitution[term] !== fact[termIndex])
                                        // Fact does not match query pattern.
                                        return null;
                                }

                                return substitution;
                            },
                            { ...substitution });

                        if(combined)
                            substitutions.push(combined);
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
        return new Observable<Fact[]>(
            subscriber =>
            {
                const key = <Fact>atom.map(element => IsVariable(element) ? undefined : element);
                let subscribers = this._atomSubscribers.get(key);
                if(!subscribers)
                {
                    subscribers = new Set<Subscriber<Fact[]>>();
                    this._atomSubscribers.set(
                        key,
                        subscribers);
                }

                subscribers.add(subscriber);

                subscriber.add(
                    () =>
                    {
                        subscribers.delete(subscriber);
                        if(!subscribers.size)
                            this._atomSubscribers.delete(key);
                    });

                subscriber.next(this.Facts(key));
            });
    }

    Observe(
        head: any[],
        ...body: Fact[]): Observable<any[]>
    {
        return combineLatest(
            body.map(atom => this.ObserveAtom(atom)),
            (...facts) => body.reduce(
                (substitutions, atom, atomIndex) =>
                {
                    let count = substitutions.length;
                    while(count--)
                    {
                        const substitution = substitutions.shift();
                        for(const fact of facts[atomIndex])
                        {
                            const combined = atom.reduce(
                                (substitution, term, termIndex) =>
                                {
                                    if(!substitution)
                                        return substitution;

                                    if(IsVariable(term))
                                    {
                                        if(typeof substitution[term] === 'undefined')
                                            substitution[term] = fact[termIndex];

                                        else if(substitution[term] !== fact[termIndex])
                                            // Fact does not match query pattern.
                                            return null;
                                    }

                                    return substitution;
                                },
                                { ...substitution });

                            if(combined)
                                substitutions.push(combined);
                        }
                    }

                    return substitutions;
                },
                [{}]).map(substitution => head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term)));
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
                const ve = this._ave.get(attribute);
                if(ve)
                    ve.delete(value);

                this._aev.get(attribute).delete(entity);

                this.PublishAtom([entity, attribute, value])
            }

            this._eav.delete(entity);
            this.PublishEntities();
            this.UnsuspendPublish();
        }
    }

    Assert(
        entity   : any,
        attribute: string,
        value    : any
        ): void
    {
        let currentValue = entity[attribute];

        if(typeof currentValue === 'undefined' && this.Cardinality(attribute) === Cardinality.Many)
            currentValue = entity[attribute] = ArrayProxyFactory(
                this,
                entity,
                attribute,
                []);

        if(currentValue instanceof Array)
            currentValue.push(value);

        else
            entity[attribute] = value;

    }

    Add(
        object: object,
        added?: Map<object, any>
        ): any
    {
        try
        {
            this.SuspendPublish();
            const added = new Map<object, any>();
            if(object instanceof Array)
                return object.map(object =>
                    this.AddObject(
                        object,
                        added));
  
            return this.AddObject(
                object,
                added);
        }
        finally
        {
            this.UnsuspendPublish();               
        }
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

        if(!entity)
        {
            entity = this.NewEntity();
            added.set(
                object,
                entity);
        }

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
        atom: Fact
        )
    {
        if(this._publishSuspended)
        {
            this._atomsToPublish.add(atom);
            return;
        };

        const subscribers = this._atomSubscribers.get(atom);
        if(subscribers)
            subscribers.forEach(subscriber => subscriber.next(this.Facts(atom)));
    }

    Publish(
        entity       : any,
        attribute    : PropertyKey,
        value        : any,
        previousValue: any
        )
    {
        if(typeof value !== "undefined")
            Match(
                this._atomSubscribers,
                [entity, attribute, value],
                atom => this.PublishAtom(atom));
        if(typeof previousValue !== "undefined")
            Match(
                this._atomSubscribers,
                [entity, attribute, previousValue],
                atom => this.PublishAtom(atom));
    }

    private Cardinality(
        attribute: string
        ): Cardinality
    {
        const attributeSchema = this._schema.get(attribute);
        if(attributeSchema && typeof attributeSchema.Cardinality !== 'undefined')
            return attributeSchema.Cardinality;

        return Cardinality.Many;
    }
}

function toPrimitive(hint)
{
    return 'Proxy';
}

function EntityProxyFactory(
    store: EavStore,
    av   : Map<PropertyKey, any>,
    aev  : Map<PropertyKey, Map<any, any>>,
    ave  : Map<PropertyKey, Map<any, any>>
    ): object
{
    let handler: ProxyHandler<object> = {
        get: function(
            target,
            p
            ): any
        {
            if(p == Symbol.toPrimitive)
                return toPrimitive;
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
            const ve = ave.get(p);
            if(ve)
            {
                if(previousValue !== value)
                {
                    const identified = ve.get(value);
                    if(typeof identified !== 'undefined')
                        throw 'Unique Identity Conflict';

                    ve.delete(previousValue);
                    ve.set(
                        value,
                        receiver);
                }
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
                store.Publish(
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
    store      : EavStore,
    attribute  : string,
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
                if(store)
                    store.PublishAtom([undefined, attribute, undefined]);
                return result;
            }
        };
}

function PushUnshiftMethodHandlerFactory(
    store      : EavStore,
    entity     : any,
    attribute  : string,
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
                if(store)
                {
                    store.SuspendPublish();
                    [...argArray].forEach(
                        value => store.Publish(
                            entity,
                            attribute,
                            value,
                            undefined));
                    store.UnsuspendPublish();
                }
                return result;
            }
        };
}

function PopShiftMethodHandlerFactory(
    store      : EavStore,
    entity     : any,
    attribute  : string,
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
                if(store && typeof result !== 'undefined')
                    store.Publish(
                        entity,
                        attribute,
                        undefined,
                        result);
                return result;
            }
        };
}

function SpliceMethodHandlerFactory(
    store      : EavStore,
    entity     : any,
    attribute  : string,
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
                if(store)
                {
                    store.SuspendPublish();
                    result.forEach(
                        deleted => store.Publish(
                            entity,
                            attribute,
                            undefined,
                            deleted));
                    [...argArray].slice(2).forEach(
                        added => store.Publish(
                            entity,
                            attribute,
                            added,
                            undefined));
                    store.UnsuspendPublish();
                }
                return result;
            }
        };
}

function methodHandlersFactory2(
    store      : EavStore,
    entity     : any,
    attribute  : string,
    targetArray: any[]
    ): Map<PropertyKey, any>
{
    const methodHandler = ArrayMethodHandlerFactory(
        store,
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

function methodHandlersFactory(
    store      : EavStore,
    entity     : any,
    attribute  : string,
    targetArray: any[]
    ): Map<PropertyKey, ProxyHandler<{ (...args): any }>>
{
    const pushUnshiftMethodHandler = PushUnshiftMethodHandlerFactory(store, entity, attribute, targetArray);
    const popShiftMethodHandler    = PopShiftMethodHandlerFactory   (store, entity, attribute, targetArray);
    const spliceMethodHandler      = SpliceMethodHandlerFactory     (store, entity, attribute, targetArray);
    return new Map<PropertyKey, any>(
        [
            ['push'   , new Proxy(Array.prototype['push'   ], pushUnshiftMethodHandler)],
            ['pop'    , new Proxy(Array.prototype['pop'    ], popShiftMethodHandler   )],
            ['shift'  , new Proxy(Array.prototype['shift'  ], popShiftMethodHandler   )],
            ['unshift', new Proxy(Array.prototype['unshift'], pushUnshiftMethodHandler)],
            ['splice' , new Proxy(Array.prototype['splice' ], spliceMethodHandler     )]
        ]);
}

export function ArrayProxyFactory(
    store      : EavStore,
    entity     : any,
    attribute  : string,
    targetArray: any[]
    )
{
    const methodHandlers = methodHandlersFactory(
        store,
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
            if(store)
                store.Publish(
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
