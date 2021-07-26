import { BehaviorSubject, Observable } from 'rxjs';

export enum Cardinality
{
    One = 1,
    Many
}

export interface IEavStore
{
    ObserveAttribute(attribute: string): Observable<[any, any][]>
    AddEntity(): any;
    AddEntity(
        keyProperty: string,
        keyValue   : any): any;
    Add(
        entity   : any,
        attribute: string,
        value    : any): void;
    Remove(
        entity   : any,
        attribute: string,
        value    : any): void
}

export class EavStore
{
    private _nextEntityId       = 1;
    private _aev                = new Map<string, Map<any, any>>();
    private _observedEntites    = new BehaviorSubject<Set<any>>(new Set<any>());
    private _observedAttributes = new Map<string, BehaviorSubject<[any, any][]>>();
    private _cardinalities      : Map<string, Cardinality>;
    private _defaultCardinality : Cardinality;

    constructor(
        cardinalities     ?: Map<string, Cardinality>,
        defaultCardinality?: Cardinality
        )
    {
        this._cardinalities      = cardinalities      ? cardinalities      : new Map<string, Cardinality>();
        this._defaultCardinality = defaultCardinality ? defaultCardinality : Cardinality.Many;
    }

    ObserveAttribute(
        attribute: string
        ): Observable<[any, any][]>
    {
        let subject = this._observedAttributes.get(attribute);
        if(!subject)
        {
            const cardinality = this.Cardinality(attribute);
            subject = new BehaviorSubject<[any, any][]>([...this._aev.get(attribute)]
                .reduce((list, pair) =>
                {
                    const [entity, value] = pair;
                    if(cardinality === Cardinality.Many)
                        list.push(...(<Array<any>>value).map(value => [entity, value]));

                    else
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

    AddEntity(): any;
    AddEntity(
        keyProperty: string,
        keyValue   : any): any;
    AddEntity(
        keyProperty?: string,
        keyValue   ?: any
        ): any
    {
        if(keyProperty)
        {
            const ev = this._aev.get(keyProperty);
            if(ev)
            {
                const existing = [...ev].find(element => element[1] === keyValue);
                if(existing)
                    return existing[0]
            }
        }

        const entity = this._nextEntityId++;
        const entities = this._observedEntites.getValue();
        entities.add(entity);
        this._observedEntites.next(entities);

        if(keyProperty)
        {
            this._aev.set(
                keyProperty,
                new Map<any, any>([[entity, keyValue]]));
            this.Publish(keyProperty);
        }

        return entity;
    }
    
    Add(
        entity   : any,
        attribute: string,
        value    : any
        ): void
    {
        let ev = this._aev.get(attribute);

        if(!ev) // Attribute never added before.
        {
            ev = new Map<any, any>();
            this._aev.set(
                attribute,
                ev);
        }

        let currentValue = ev.get(entity);

        if(typeof currentValue === 'undefined' && this.Cardinality(attribute) === Cardinality.Many)
        {
            currentValue = [];
            ev.set(
                entity,
                currentValue);
        }

        if(currentValue instanceof Array)
            currentValue.push(value);

        else
            ev.set(
                entity,
                value);

        this.Publish(attribute);
    }

    Remove(
        entity   : any,
        attribute: string,
        value    : any
        ): void
    {
        const ev = this._aev.get(attribute);
        if(!ev)
            return;

        let currentValue = ev.get(entity);

        if(typeof currentValue === 'undefined')
            return;

        if(currentValue instanceof Array)
        {
            currentValue.splice(
                currentValue.indexOf(value),
                1);

            if(!currentValue.length)
                ev.delete(entity);
        }
        else
            ev.delete(entity);

        this.Publish(attribute);
    }

    private Publish(
        attribute: string
        )
    {
        const attributeSubject = this._observedAttributes.get(attribute);
        if(!attributeSubject)
            return;

        const cardinality = this.Cardinality(attribute);

        attributeSubject.next([...this._aev.get(attribute)]
            .reduce((list, pair) =>
            {
                const [entity, value] = pair;
                if(cardinality === Cardinality.Many)
                    list.push(...(<Array<any>>value).map(value => [entity, value]));

                else
                    list.push([entity, value]);

                return list;
            },
            []));
    }

    private Cardinality(
        property: string
        ): Cardinality
    {
        return this._cardinalities.has(property) ? this._cardinalities.get(property) : this._defaultCardinality;
    }
}
