import { BehaviorSubject, Observable } from 'rxjs';

export enum Cardinality
{
    One = 1,
    Many
}

export interface AttributeSchema
{
    Name           : string,
    UniqueIdentity?: boolean,
    Cardinality   ?: Cardinality
}

export interface IEavStore
{
    Entities: Observable<Set<any>>;
    ObserveAttribute(attribute: string): Observable<[any, any][]>
    NewEntity(): any;
    Import(object: object);
}

export class EavStore
{
    private _eav                 = new Map<any, Map<string, any>>();
    private _aev                 = new Map<string, Map<any, any>>();
    private _ave                 : Map<string, Map<any, any>>;
    private _entitiesObservable  = new BehaviorSubject<Set<any>>(new Set<any>());
    private _attributeObservable = new Map<string, BehaviorSubject<[any, any][]>>();
    private _schema              : Map<string, AttributeSchema>;

    constructor(
        ...attributeSchema: AttributeSchema[]
        )
    {
        this._schema = new Map<string, AttributeSchema>(attributeSchema.map(attributeSchema => [attributeSchema.Name, attributeSchema]));
        this._ave    = new Map<string, Map<any, any>>(
            attributeSchema
                .filter(attributeSchema => attributeSchema.UniqueIdentity)
                .map(attributeSchema => [attributeSchema.Name, new Map<any, any>()]));
    }

    get Entities(): Observable<Set<any>>
    {
        return this._entitiesObservable;
    }

    ObserveAttribute(
        attribute: string
        ): Observable<[any, any][]>
    {
        let subject = this._attributeObservable.get(attribute);
        if(!subject)
        {
            subject = new BehaviorSubject<[any, any][]>([...this._aev.get(attribute)]
                .reduce((list, pair) =>
                {
                    const [entity, value] = pair;
                    if(value instanceof Array)
                        list.push(...value.map(value => [entity, value]));

                    else if(typeof value !== 'undefined' && value !== null)
                        list.push([entity, value]);

                    return list;
                },
                []));
            this._attributeObservable.set(
                attribute,
                subject);
        }
        return subject;
    }

    NewEntity(): any
    {
        const av = new Map<string, any>();
        const entity = EntityProxyFactory(
            this,
            av,
            this._aev,
            this._ave);
        this._eav.set(
            entity,
            av);

        this._entitiesObservable.next(new Set<any>(this._eav.keys()));
    }

    Add(
        entity   : any,
        attribute: string,
        value    : any
        )
    {
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

    Import(
        object   : object,
        imported?: Map<object, any>
        ): any
    {
        imported = imported ? imported : new Map<object, any>();
        if(typeof object !== 'object' ||
            object === null ||
            object instanceof Date)
            return object;

        let entity = imported.get(object);
        if(entity)
            return entity;

        [...this._ave]
            .filter(([attribute,]) => attribute in object)
            .forEach(([attribute,ve]) =>
            {
                if(typeof entity === 'undefined')
                    entity = ve[object[attribute]];

                else if(entity != ve[object[attribute]])
                    throw 'Unique Identity Conflict';
            });

        if(!entity)
            entity = this.NewEntity();

        for(let key in object)
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
                    .map(element => this.Import(
                        element,
                        imported))
                    .filter(element => !entity[key].includes(element)));
            }
            else
                entity[key] = this.Import(
                    value,
                    imported);
        }

        imported.set(
            object,
            entity);

        return entity;
    }

    public Publish(
        attribute: string
        )
    {
        const attributeSubject = this._attributeObservable.get(attribute);
        if(attributeSubject)
            attributeSubject.next([...this._aev.get(attribute)]
                .reduce((list, pair) =>
                {
                    const [entity, value] = pair;
                    if(value instanceof Array)
                        list.push(...value.map(value => [entity, value]));

                    else if(typeof value !== 'undefined' && value !== null)
                        list.push([entity, value]);

                    return list;
                },
                []));
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
    av   : Map<string, any>,
    aev  : Map<string, Map<any, any>>,
    ave  : Map<string, Map<any, any>>
    ): object
{
    let handler: ProxyHandler<object> = {
        get: function(
            target,
            p
            ): any
        {
            let value;
            if(typeof p === 'string')
                value = av.get(p);
            return value;
        },
        set: function(
            target,
            p,
            value,
            receiver
            ): boolean
        {
            if(typeof p === 'string')
            {
                const ve = ave.get(p);
                if(ve)
                {
                    const currentValue = av.get(p);
                    if(currentValue !== value)
                    {
                        ve.delete(currentValue);
                        const identified = ve.get(value);
                        if(typeof identified !== 'undefined')
                            throw 'Unique Identity Conflict';

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

                if(store)
                    store.Publish(p);
            }
            return true;
        }
    };

    return new Proxy(
        null,
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
                    store.Publish(attribute);
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
            targetArray[methodName],
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
                store.Publish(attribute);
            return true;
        }
    };

    return new Proxy(
        targetArray,
        handler);
}
