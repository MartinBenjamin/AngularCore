import { Observable, Subscriber } from 'rxjs';
import { AttributeSchema, Cardinality, IEavStore, StoreSymbol } from './IEavStore';

export type Fact = [any, string, any];

const IsVariable = element => typeof element === 'string' && element[0] === '?';
const IsConstant = element => !(typeof element === 'undefined' || IsVariable(element));

export class EavStore implements IEavStore
{
    private _eav                  = new Map<any, Map<PropertyKey, any>>();
    private _aev                  = new Map<PropertyKey, Map<any, any>>();
    private _ave                  : Map<PropertyKey, Map<any, any>>;
    private _entitiesSubscribers  : Subscriber<Set<any>>[] = [];
    private _attributeSubscribers = new Map<string, Subscriber<[any, any][]>[]>();
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
                    if(value)
                    {
                        if(value instanceof Array)
                            facts.push(...value.map<Fact>(value => [entity, attribute, value]));

                        else if(typeof value !== 'undefined' && value !== null)
                            facts.push([entity, attribute, value]);
                    }
                }
                else for(const [attribute, value] of av)
                    if(typeof attribute === 'string')
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
                if(typeof attribute === 'string')
                {
                    if(value instanceof Array)
                        facts.push(...value.map<Fact>(value => [entity, attribute, value]));

                    else if(typeof value !== 'undefined' && value !== null)
                        facts.push([entity, attribute, value]);
                }

        return IsConstant(value) ? facts.filter(fact => fact[2] === value) : facts;
    }

    Query(
        head: any[],
        ...body: Fact[]
        ): any[][]
    {
        const headVariables = head.filter(term => IsVariable(term));

        headVariables.filter(headVariable => body.every(atom => !atom.includes(headVariable))).forEach(
            headVariable =>
            {
                throw `Head variable not in body: ${headVariable}`;
            });

        let outerArray = [];
        for(const atom of body)
        {
            if(atom === body[0])
                for(const inner of this.Facts(atom))
                {
                    const combined = atom.reduce(
                        (previousValue, term, termIndex) =>
                        {
                            if(!previousValue)
                                return previousValue;

                            if(IsVariable(term))
                            {
                                if(typeof previousValue[term] === 'undefined')
                                    previousValue[term] = inner[termIndex];

                                else if(previousValue[term] !== inner[termIndex])
                                    // Inner does not match query pattern.
                                    return null;
                            }

                            return previousValue;
                        },
                        {});

                    if(combined)
                        outerArray.push(combined);
                }
            else
            {
                let count = outerArray.length;
                while(count--)
                {
                    const outer = outerArray.shift();
                    // Substitute known variables.
                    const queryPattern = <Fact>atom.map(term => (term in outer) ? outer[term] : term);
                    for(const inner of this.Facts(queryPattern))
                    {
                        const combined = queryPattern.reduce(
                            (previousValue, term, termIndex) =>
                            {
                                if(!previousValue)
                                    return previousValue;

                                if(IsVariable(term))
                                {
                                    if(typeof previousValue[term] === 'undefined')
                                        previousValue[term] = inner[termIndex];

                                    else if(previousValue[term] !== inner[termIndex])
                                        // Inner does not match query pattern.
                                        return null;
                                }

                                return previousValue;
                            },
                            { ...outer });

                        if(combined)
                            outerArray.push(combined);
                    }
                }
            }
        }

        return outerArray.map(outer => head.map(term => (term in outer) ? outer[term] : term));
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
            for(const attributeValue of av)
            {
                const [attribute, value] = attributeValue;
                const ve = this._ave.get(attribute);
                if(ve)
                    ve.delete(value);

                this._aev.get(attribute).delete(entity);

                if(typeof attribute === 'string')
                    attributesToPublish.push(attribute);
            }

            this._eav.delete(entity);
            this.PublishEntities();
            this._attributesToPublish.forEach(attribute => this.PublishAttribute(attribute));               
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
            //const attributeValues = <[any, any][]>this.Query(['?entity', '?value'], ['?entity', attribute, '?value']);
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
                const result = targetMethod.call(
                    targetArray,
                    ...argArray);
                if(store)
                {
                    store.SuspendPublish();
                    [...result].forEach(
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

export function ArrayProxyFactory(
    store      : EavStore,
    attribute  : string,
    targetArray: any[]
    )
{
    const methodHandler = ArrayMethodHandlerFactory(
        store,
        attribute,
        targetArray);

    const interceptors = new Map<PropertyKey, object>(
        [
            'push',
            'pop',
            'shift',
            'unshift',
            'splice',
        ].map(methodName => [methodName, new Proxy(
            Array.prototype[methodName],
            methodHandler)]));
    let handler: ProxyHandler<[]> = {
        get: function(
            target,
            p
            ): any
        {
            const interceptor = interceptors.get(p);
            if(interceptor)
                return interceptor;

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