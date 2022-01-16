import { combineLatest, Observable, Subscriber } from 'rxjs';
import { ArrayKeyedMap, TrieNode } from './ArrayKeyedMap';
import { AttributeSchema, Cardinality, Fact, IEavStore, StoreSymbol } from './IEavStore';

export const IsVariable = element => typeof element === 'string' && element[0] === '?';
export const IsConstant = element => !(typeof element === 'undefined' || IsVariable(element));

export interface Rule
{
    Head: [any, ...any[]],
    Body: Fact[]
}

export interface AtomSubscriber
{
    Atom      : Fact,
    Subscriber: Subscriber<Fact[]>
}

function Match<TTrieNode extends TrieNode<TTrieNode, V>, V>(
    trieNode: TTrieNode,
    path    : any[],
    callback: (value: V) => void): void
{
    if(path.length === 0)
    {
        if(trieNode.value !== undefined)
            callback(trieNode.value);

        return;
    }

    const [first, ...rest] = path;
    let child = trieNode.children.get(first);
    if(child)
        Match(
            child,
            rest,
            callback);

    child = trieNode.children.get(undefined);
    if(child)
        Match(
            child,
            rest,
            callback);
}

export class EavStore implements IEavStore
{
    private _eav                  = new Map<any, Map<PropertyKey, any>>();
    private _aev                  = new Map<PropertyKey, Map<any, any>>();
    private _ave                  : Map<PropertyKey, Map<any, any>>;
    private _entitiesSubscribers  : Subscriber<Set<any>>[] = [];
    private _attributeSubscribers = new Map<string, Subscriber<[any, any][]>[]>();
    private _atomSubscribers      = new ArrayKeyedMap<Fact, Set<AtomSubscriber>>();
    private _schema               : Map<string, AttributeSchema>;
    private _publishSuspended     : number;
    private _publishEntities      : boolean;
    private _attributesToPublish  = new Set<string>();

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
        return new Observable<[any, any][]>(
            subscriber =>
            {
                let subscribers = this._attributeSubscribers.get(attribute);
                if(!subscribers)
                {
                    subscribers = [];
                    this._attributeSubscribers.set(
                        attribute,
                        subscribers);
                }

                subscribers.push(subscriber);
                subscriber.next(this.Attribute(attribute));

                subscriber.add(
                    () =>
                    {
                        const index = subscribers.indexOf(subscriber);

                        if(index != -1)
                            subscribers.splice(
                                index,
                                1);

                        if(!subscribers.length)
                            this._attributeSubscribers.delete(attribute);
                    });
            });
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
                const atomSubscriber: AtomSubscriber =
                {
                    Atom      : atom,
                    Subscriber: subscriber
                };

                let key = <Fact>atom.map(element => IsVariable(element) ? undefined : element);
                let subscribers = this._atomSubscribers.get(key);
                if(!subscribers)
                {
                    subscribers = new Set<AtomSubscriber>();
                    this._atomSubscribers.set(
                        key,
                        subscribers);
                }

                subscribers.add(atomSubscriber);

                subscriber.add(
                    () =>
                    {
                        subscribers.delete(atomSubscriber);
                        if(!subscribers.size)
                            this._atomSubscribers.delete(atom);
                    });

                subscriber.next(this.Facts(atom));
            });
    }

    Observe<T extends [any, ...any[]]>(
        head   : T,
        ...body: Fact[]): Observable<{ [K in keyof T]: any; }[]>
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
                [{}]).map(substitution => <{ [K in keyof T]: any; }>head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term)));
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
            const attributesToPublish: string[] = [];
            for(const [attribute, value] of av)
            {
                const ve = this._ave.get(attribute);
                if(ve)
                    ve.delete(value);

                this._aev.get(attribute).delete(entity);

                if(typeof attribute === 'string')
                    attributesToPublish.push(attribute);
            }

            this._eav.delete(entity);
            this.PublishEntities();
            attributesToPublish.forEach(attribute => this.PublishAttribute(attribute));               
        }
    }

    Add(
        entity   : any,
        attribute: string,
        value    : any): void;
    Add(object: object): any;
    Add(objects: object[]): any[];
    Add(
        entity    : any,
        attribute?: string,
        value    ?: any
        ): any
    {
        if(typeof attribute === 'undefined')
            try
            {
                this.SuspendPublish();
                const added = new Map<object, any>();
                if(entity instanceof Array)
                    return entity.map(object =>
                        this.AddObject(
                            object,
                            added));
  
                return this.AddObject(
                    entity,
                    added);
            }
            finally
            {
                this.UnsuspendPublish();               
            }

        let currentValue = entity[attribute];

        if(typeof currentValue === 'undefined' && this.Cardinality(attribute) === Cardinality.Many)
            currentValue = entity[attribute] = ArrayProxyFactory(
                this,
                attribute,
                []);

        if(currentValue instanceof Array)
            currentValue.push(value);

        else
            entity[attribute] = value;
    }

    Clear(): void
    {
        this._eav.clear();
        this._aev.clear();

        for(const ve of this._ave.values())
            ve.clear();

        this.PublishEntities();
        for(const attribute of this._attributeSubscribers.keys())
            this.PublishAttribute(attribute);
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
            entity = this.NewEntity();

        for(const key in object)
        {
            let value = object[key];
            if(value instanceof Array)
            {
                if(!entity[key])
                    entity[key] = ArrayProxyFactory(
                        this,
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

        added.set(
            object,
            entity);

        return entity;
    }

    SuspendPublish(): void
    {
        if(!this._publishSuspended)
        {
            this._publishEntities = false;
            this._attributesToPublish.clear();
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

            this._attributesToPublish.forEach(attribute => this.PublishAttribute(attribute));
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

    PublishAttribute(
        attribute: string
        )
    {
        if(this._publishSuspended)
        {
            this._attributesToPublish.add(attribute);
            return;
        };

        const subscribers = this._attributeSubscribers.get(attribute);
        if(subscribers)
        {
            const attributeValues = this.Attribute(attribute);
            //const attributeValues = this.Query(['?entity', '?value'], ['?entity', attribute, '?value']);
            subscribers.forEach(subscriber => subscriber.next(attributeValues));
        }
    }

    Publish(
        entity       : any,
        attribute    : PropertyKey,
        value        : any,
        previousValue: any
        )
    {
        let atomsToPublish = new Set<AtomSubscriber>();
        if(typeof value !== "undefined")
            Match(
                this._atomSubscribers,
                [entity, attribute, value],
                (atomSubscribers: Set<AtomSubscriber>) => atomSubscribers.forEach(atomSubscriber => this.PublishAtom(atomSubscriber)));
        if(typeof previousValue !== "undefined")
            Match(
                this._atomSubscribers,
                [entity, attribute, previousValue],
                (atomSubscribers: Set<AtomSubscriber>) => atomSubscribers.forEach(atomSubscriber => this.PublishAtom(atomSubscriber)));
    }

    PublishAtom(
        atomSubscriber: AtomSubscriber
        ): void
    {
        atomSubscriber.Subscriber.next(this.Facts(atomSubscriber.Atom));
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
            const ve = ave.get(p);
            if(ve)
            {
                const currentValue = av.get(p);
                if(currentValue !== value)
                {
                    const identified = ve.get(value);
                    if(typeof identified !== 'undefined')
                        throw 'Unique Identity Conflict';

                    ve.delete(currentValue);
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

            if(typeof p === 'string' && !(value instanceof Array))
                store.PublishAttribute(p);

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
                    store.PublishAttribute(attribute);
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

function methodHandlersFactory(
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

function methodHandlersFactory2(
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
    attribute  : string,
    targetArray: any[]
    )
{
    const methodHandlers = methodHandlersFactory(
        store,
        null,
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
            target[p] = value;
            if(store)
                store.PublishAttribute(attribute);
            return true;
        }
    };

    return new Proxy(
        targetArray,
        handler);
}
