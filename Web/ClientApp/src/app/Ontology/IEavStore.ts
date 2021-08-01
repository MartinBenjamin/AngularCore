import { BehaviorSubject, Observable } from 'rxjs';

export enum Cardinality
{
    One = 1,
    Many
}

export interface IEavStore
{
    Entities: Observable<Set<any>>;
    ObserveAttribute(attribute: string): Observable<[any, any][]>
    Import(object: object);
}

export class EavStore
{
    private _eav                = new Map<any, Map<string, any>>();
    private _aev                = new Map<string, Map<any, any>>();
    private _ave                = new Map<string, Map<any, any>>();
    private _observedEntites    = new BehaviorSubject<Set<any>>(new Set<any>());
    private _observedAttributes = new Map<string, BehaviorSubject<[any, any][]>>();

    constructor(
        uniqueAttributes: Set<string>
        )
    {
        this._ave = new Map<string, Map<any, any>>(
            [...uniqueAttributes].map(uniqueAttribute => [uniqueAttribute, new Map<any, any>()]));
    }

    get Entities(): Observable<Set<any>>
    {
        return this._observedEntites;
    }

    ObserveAttribute(
        attribute: string
        ): Observable<[any, any][]>
    {
        let subject = this._observedAttributes.get(attribute);
        if(!subject)
        {
            subject = new BehaviorSubject<[any, any][]>([...this._aev.get(attribute)]
                .reduce((list, pair) =>
                {
                    const [entity, value] = pair;
                    if(value instanceof Array)
                        list.push(...value.map(value => [entity, value]));

                    else if(value !== null)
                        list.push([entity, value]);

                    return list;
                },
                []));
            this._observedAttributes.set(
                attribute,
                subject);
        }
        return subject;
    }

    Import(
        object   : object,
        imported?: Map<object, any>
        ): any
    {
        let top = typeof imported === 'undefined';
        imported = imported ? imported : new Map<object, any>();
        if(typeof object !== "object" ||
            object === null ||
            object instanceof Date)
            return object;

        let entity = imported.get(object);
        let av: Map<string, any>;
        if(entity)
            return entity;

        for(const [attribute, ve] of this._ave)
            if(attribute in object)
            {
                const value = object[attribute];
                entity = ve.get(value);
                if(!entity)
                {
                    av = new Map<string, any>([[attribute, value]]);
                    entity = EntityProxyFactory(
                        this,
                        av,
                        this._aev);
                    this._eav.set(
                        entity,
                        av);
                    ve.set(
                        value,
                        entity);

                    let ev = this._aev.get(attribute);
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

                }
                else
                    av = this._eav.get(entity);

                break;
            }

        if(!entity)
        {
            av = new Map<string, any>();
            entity = EntityProxyFactory(
                this,
                av,
                this._aev);
            this._eav.set(
                entity,
                av);
        }

        for(let key in object)
        {
            let value = object[key];
            if(value instanceof Array)
                entity[key] = ArrayProxyFactory(
                    this,
                    key,
                    value.map(element => this.Import(
                        element,
                        imported)));

            else
                entity[key] = this.Import(
                    value,
                    imported);
        }

        imported.set(
            object,
            entity);

        if(top)
        {
            this._observedEntites.next(new Set<any>(this._eav.keys()));
            [...this._aev.keys()].forEach(this.Publish)
        }

        return entity;
    }

    public Publish(
        attribute: string
        )
    {
        const attributeSubject = this._observedAttributes.get(attribute);
        if(attributeSubject)
            attributeSubject.next([...this._aev.get(attribute)]
                .reduce((list, pair) =>
                {
                    const [entity, value] = pair;
                    if(value instanceof Array)
                        list.push(...value.map(value => [entity, value]));

                    else if(value !== null)
                        list.push([entity, value]);

                    return list;
                },
                []));
    }
}

function EntityProxyFactory(
    store: EavStore,
    av   : Map<string, any>,
    aev  : Map<string, Map<any, any>>
    )
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
            return value ? value : null;
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
