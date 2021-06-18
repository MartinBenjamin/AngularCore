import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { DomainObject } from "../CommonDomainObjects";
import { LongestPaths } from "./AdjacencyList";
import { ClassExpressionNavigator } from './ClassExpressionNavigator';
import { ClassVisitor } from "./ClassMembershipEvaluator";
import { Group } from './Group';
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IOntology } from './IOntology';
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";
import { TransitiveClosure3 } from "./TransitiveClosure";

export function GroupBy<T, TKey, TValue, TResult>(
    iterable      : Iterable<T>,
    keySelector   : (t: T) => TKey,
    valueSelector : (t: T) => TValue,
    resultSelector: (key: TKey, valueIterable: Iterable<TValue>) => TResult
    ): Iterable<TResult>
{
    return {
        *[Symbol.iterator]()
        {
            const map = Group(
                iterable,
                keySelector,
                valueSelector);

            for(const pair of map)
                yield resultSelector(
                    pair[0],
                    pair[1]);
        }
    };
}

export function GroupJoin<TLeft, TRight, TKey>(
    leftIterable    : Iterable<TLeft>,
    rightIterable   : Iterable<TRight>,
    leftKeySelector : (left: TLeft) => TKey,
    rightKeySelector: (right: TRight) => TKey
    ): Map<TLeft, TRight[]>
{
    const map = Group(
        rightIterable,
        rightKeySelector,
        (t: TRight) => t);

    const join = new Map<TLeft, TRight[]>();
    const empty: TRight[] = [];
    for(const left of leftIterable)
    {
        const rights = map.get(leftKeySelector(left));
        join.set(
            left,
            rights ? rights : empty);
    }

    return join;
}

export interface IStore
{
    ObjectDomain: Observable<Set<any>>;
    ObserveProperty(property: string): Observable<[any, any][]>;
    NewEntity<TEntity>(): TEntity;
    Add(
        entity  : any,
        property: string,
        value   : any);
    Remove(
        entity  : any,
        property: string,
        value   : any);
}

export class Store implements IStore
{
    private _nextId       = 1;
    private _objectDomain = new BehaviorSubject<Set<any>>(new Set<any>());
    private _properties   = new Map<string, BehaviorSubject<[any, any][]>>();
    private _objects      = new Map<any, any>();
    private _functionalProperties = new Set<string>();

    get ObjectDomain(): Observable<Set<any>>
    {
        return this._objectDomain;
    }

    ObserveProperty(
        property: string
        ): Observable<[any, any][]>
    {
        let subject = this._properties.get(property);
        if(!subject)
        {
            subject = new BehaviorSubject<[any, any][]>([]);
            this._properties.set(
                property,
                subject);
        }
        return subject;
    }

    LoadEntity(
        entity: any,
        loaded: Set<any>
        ): void
    {
        this._objects.set(
            entity.Id,
            entity);

        for(const property in entity)
            if(property !== 'Id')
            {
                const propertySubject = this._properties.get(property);
                if(propertySubject)
                {
                    const value = entity[property];
                    const values = propertySubject.getValue();
                    if(typeof value === 'object')
                    {
                        if('Id' in value)
                            values.push([entity.Id, value.Id])

                        else if(value instanceof Array)
                            value.forEach(value => values.push([entity.Id, 'Id' in value ? value.Id : value]));

                        else
                            values.push([entity.Id, 'Id' in value ? value.Id : value]);
                    }
                    else
                        values.push([entity.Id, value]);

                    propertySubject.next(values);
                }
            }
    }

    NewEntity<TEntity>(): TEntity
    {
        const entity: any = {
            Id: this._nextId++
        };

        this._objects.set(
            entity.Id,
            entity);
        this._objectDomain.next(new Set<any>(this._objects.keys()));
        return <TEntity>entity;
    }

    Add(
        entity  : any,
        property: string,
        value   : any
        )
    {
        let currentValue = entity[property];

        if(typeof currentValue === 'undefined' && this._functionalProperties.has(property))
            currentValue = entity[property] = [];

        if(currentValue instanceof Array)
            currentValue.push(value);

        else
            entity[property] = value;

        const propertySubject = this._properties.get(property);
        if(propertySubject)
        {
            const values = propertySubject.getValue();
            values.push([this.Map(entity), this.Map(value)]);
            propertySubject.next(values);
        }
    }

    Remove(
        entity  : any,
        property: string,
        value   : any
        )
    {
        let currentValue = entity[property];

        if(currentValue instanceof Array)
            currentValue.splice(
                currentValue.indexOf(value),
                1);

        else
            delete entity[property];

        const propertySubject = this._properties.get(property);
        if(propertySubject)
        {
            const mappedEntity = this.Map(entity);
            const mappedValue  = this.Map(value);
            const values = propertySubject.getValue();
            values.splice(
                values.findIndex(
                    value => value[0] === mappedEntity && value[1] === mappedValue),
                1);
            propertySubject.next(values);
            //propertySubject.next(values.filter(value => value[0] !== entity.Id || value[1] !== value));
        }        
    }

    UpdateValue(
        entity   : any,
        property : string,
        newValue : any,
        oldValue?: any
        )
    {
        if(typeof oldValue === 'undefined')
        {
            oldValue = entity[property];
            entity[property] = newValue;
        }
        else
        {
            let currentValue = entity[property];
            if(currentValue instanceof Array)
            {
                const index = currentValue.indexOf(oldValue);
                if(index !== -1)
                    currentValue[index] = newValue;
            }
            else
                entity[property] = newValue;
        }

        const propertySubject = this._properties.get(property);
        if(propertySubject)
        {
            const mappedEntity   = this.Map(entity);
            const mappedNewValue = this.Map(newValue);
            const mappedOldValue = this.Map(oldValue);

            const values = propertySubject.getValue();
            const index = values.findIndex(value => value[0] === mappedEntity && value[1] === mappedOldValue);

            if(index != -1)
            {
                values[index][1] = mappedNewValue;
                propertySubject.next(values);
            }
        }  
    }

    private Map(
        value: any
        ): any
    {
        return typeof value === 'object' && 'Id' in value ? value.Id : value;
    }
}

export class ObservableGenerator implements IClassExpressionSelector<Observable<Set<any>>>
{
    //private _objectDomain             : Subject<Set<any>> = new BehaviorSubject<Set<any>>(new Set<any>());
    private _properties               : Map<string, Subject<[any, any][]>> = new Map<string, BehaviorSubject<[any, any][]>>();;
    private _classes                  = new Map<IClassExpression, Observable<Set<any>>>();
    private _classDefinitions         : Map<IClass, IClassExpression[]>;
    private _definedClasses           : IClass[];
    private _functionalDataProperties = new Set<IDataPropertyExpression>();

    constructor(
        private _ontology: IOntology,
        private _store  ?: IStore
        )
    {
        if(!this._store)
            this._store = new Store();

        for(let functionalDataProperty of this._ontology.Get(this._ontology.IsAxiom.IFunctionalDataProperty))
            this._functionalDataProperties.add(functionalDataProperty.DataPropertyExpression);

        let classes = [...this._ontology.Get(this._ontology.IsAxiom.IClass)];
        let adjacencyList = new Map<IClass, Set<IClass>>(classes.map(class$ => [class$, new Set<IClass>()]));
        for(let equivalentClassExpressions of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
        {
            let equivalentClasses = <IClass[]>equivalentClassExpressions.ClassExpressions.filter(classExpression => this._ontology.IsAxiom.IClass(classExpression));
            for(let index1 = 0; index1 < equivalentClasses.length; ++index1)
                for(let index2 = index1; index2 < equivalentClasses.length; ++index2)
                {
                    let class1 = equivalentClasses[index1];
                    let class2 = equivalentClasses[index2];
                    adjacencyList.get(class1).add(class2);
                    adjacencyList.get(class2).add(class1);
                }
        }

        let transitiveClosure = TransitiveClosure3(adjacencyList);

        let definitions: [IClass, IClassExpression][] = [];
        for(let equivalentClasses of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
            for(let class$ of equivalentClasses.ClassExpressions.filter(classExpression => this._ontology.IsAxiom.IClass(classExpression)))
            {
                for(let classExpression of equivalentClasses.ClassExpressions.filter(classExpression => !this._ontology.IsAxiom.IClass(classExpression)))
                    for(let equivalentClass of transitiveClosure.get(<IClass>class$))
                        definitions.push(
                            [
                                equivalentClass,
                                classExpression
                            ]);
                break;
            }

        this._classDefinitions = Group(
            definitions,
            definition => definition[0],
            definition => definition[1]);

        let adjacent: Set<IClass> = null;
        let empty = new Set<IClass>();
        adjacencyList = new Map<IClass, Set<IClass>>(classes.map(class$ => [class$, empty]));
        let classVisitor = new ClassExpressionNavigator(new ClassVisitor(class$ => adjacent.add(class$)));

        for(let [class$, classExpression] of this._classDefinitions)
        {
            adjacent = new Set<IClass>();
            classExpression[0].Accept(classVisitor);
            adjacencyList.set(
                class$,
                adjacent);
        }

        let longestPaths = LongestPaths(adjacencyList);
        this._definedClasses = [...this._classDefinitions.keys()]
            .sort((a, b) => longestPaths.get(b) - longestPaths.get(a));
    }

    Class(
        class$: IClass
        ): Observable<Set<any>>
    {
        throw new Error("Method not implemented.");
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): Observable<Set<any>>
    {
        return combineLatest(
            objectIntersectionOf.ClassExpressions.map(classExpression => classExpression.Select(this)),
            (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs])));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        ): Observable<Set<any>>
    {
        return combineLatest(
            objectUnionOf.ClassExpressions.map(classExpression => classExpression.Select(this)),
            (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs].filter(member => rhs.has(member)))));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        ): Observable<Set<any>>
    {
        return combineLatest(
            this._store.ObjectDomain,
            objectComplementOf.ClassExpression.Select(this),
            (objectDomain, classExpression) => new Set<any>([...objectDomain].filter(member => !classExpression.has(member))));
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): Observable<Set<any>>
    {
        return new BehaviorSubject<Set<any>>(new Set<any>(objectOneOf.Individuals.map(individual => this.InterpretIndividual(individual))));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        ): Observable<Set<any>>
    {
        return combineLatest(
            this.PropertyExpression(objectSomeValuesFrom.ObjectPropertyExpression),
            objectSomeValuesFrom.ClassExpression.Select(this),
            (objectPropertyExpression, classExpression) =>
                new Set<any>(
                    objectPropertyExpression
                        .filter(member => classExpression.has(member[1]))
                        .map(member => member[0])));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        ): Observable<Set<any>>
    {
        return combineLatest(
            this.PropertyExpression(objectAllValuesFrom.ObjectPropertyExpression).pipe(map(this.GroupByDomain)),
            objectAllValuesFrom.ClassExpression.Select(this),
            (groupedByDomain, classExpression) =>
                new Set<any>(
                    [...groupedByDomain.entries()]
                        .filter(entry => entry[1].every(individual => classExpression.has(individual)))
                        .map(entry => entry[0])));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): Observable<Set<any>>
    {
        const individual = this.InterpretIndividual(objectHasValue.Individual);
        return this.PropertyExpression(objectHasValue.ObjectPropertyExpression).pipe(
            map(objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(member => member[1] === individual)
                    .map(member => member[0]))));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): Observable<Set<any>>
    {
        return this.PropertyExpression(objectHasSelf.ObjectPropertyExpression).pipe(
            map(objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(member => member[0] === member[1])
                    .map(member => member[0]))));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): Observable<Set<any>>
    {
        if(objectMinCardinality.Cardinality === 0)
            return this._store.ObjectDomain;

        let observableObjectPropertyExpression: Observable<[any, any][]> = this.PropertyExpression(objectMinCardinality.ObjectPropertyExpression);
        if(objectMinCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                objectMinCardinality.ClassExpression.Select(this),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        if(objectMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return observableObjectPropertyExpression.pipe(
                map(objectPropertyExpression => new Set<any>(objectPropertyExpression.map(member => member[0]))));

        return observableObjectPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length >= objectMinCardinality.Cardinality)
                    .map(entry => entry[0]))));
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        ): Observable<Set<any>>
    {
        let observableObjectPropertyExpression: Observable<[any, any][]> = this.PropertyExpression(objectMaxCardinality.ObjectPropertyExpression);
        if(objectMaxCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this.ClassExpression(objectMaxCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        return combineLatest(
            this._store.ObjectDomain,
            observableObjectPropertyExpression,
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    member => member[0])).pipe(
                        map(groupedByDomain =>
                            new Set<any>([...groupedByDomain.entries()]
                                .filter(entry => entry[1].length <= objectMaxCardinality.Cardinality)
                                .map(entry => entry[0]))));
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        ): Observable<Set<any>>
    {
        let observableObjectPropertyExpression: Observable<[any, any][]> = this.PropertyExpression(objectExactCardinality.ObjectPropertyExpression);
        if(objectExactCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this.ClassExpression(objectExactCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        if(objectExactCardinality.Cardinality === 0)
            return combineLatest(
                this._store.ObjectDomain,
                observableObjectPropertyExpression,
                (objectDomain, objectPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        objectPropertyExpression,
                        individual => individual,
                        member => member[0])).pipe(
                            map(groupedByDomain =>
                                new Set<any>([...groupedByDomain.entries()]
                                    .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                                    .map(entry => entry[0]))));

        return observableObjectPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                    .map(entry => entry[0]))));
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        ): Observable<Set<any>>
    {
        return this.PropertyExpression(dataSomeValuesFrom.DataPropertyExpression).pipe(
            map(dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(member => dataSomeValuesFrom.DataRange.HasMember(member[1])))));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        ): Observable<Set<any>>
    {
        return this.PropertyExpression(dataAllValuesFrom.DataPropertyExpression).pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>(
                    [...groupedByDomain.entries()]
                        .filter(entry => entry[1].every(value => dataAllValuesFrom.DataRange.HasMember(value)))
                        .map(entry => entry[0]))));
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): Observable<Set<any>>
    {
        return this.PropertyExpression(dataHasValue.DataPropertyExpression).pipe(
            map(dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(member => member[1] === dataHasValue.Value)
                    .map(member => member[0]))));
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        ): Observable<Set<any>>
    {
        if(dataMinCardinality.Cardinality === 0)
            return this._store.ObjectDomain;

        let observableDataPropertyExpression: Observable<[any, any][]> = this.PropertyExpression(dataMinCardinality.DataPropertyExpression);
        if(dataMinCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(member => dataMinCardinality.DataRange.HasMember(member[1]))));

        if(dataMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => new Set<any>(dataPropertyExpression.map(member => member[0]))));

        return observableDataPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length >= dataMinCardinality.Cardinality)
                    .map(entry => entry[0]))));
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        ): Observable<Set<any>>
    {
        let observableDataPropertyExpression: Observable<[any, any][]> = this.PropertyExpression(dataMaxCardinality.DataPropertyExpression);
        if(dataMaxCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(member => dataMaxCardinality.DataRange.HasMember(member[1]))));

        return combineLatest(
            this._store.ObjectDomain,
            observableDataPropertyExpression,
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    member => member[0])).pipe(
                        map(groupedByDomain =>
                            new Set<any>([...groupedByDomain.entries()]
                                .filter(entry => entry[1].length <= dataMaxCardinality.Cardinality)
                                .map(entry => entry[0]))));
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        ): Observable<Set<any>>
    {
        let observableDataPropertyExpression: Observable<[any, any][]> = this.PropertyExpression(dataExactCardinality.DataPropertyExpression);
        if(dataExactCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(member => dataExactCardinality.DataRange.HasMember(member[1]))));

        if(dataExactCardinality.Cardinality === 0)
            return combineLatest(
                this._store.ObjectDomain,
                observableDataPropertyExpression,
                (objectDomain, dataPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        dataPropertyExpression,
                        individual => individual,
                        member => member[0])).pipe(
                            map(groupedByDomain =>
                                new Set<any>([...groupedByDomain.entries()]
                                    .filter(entry => entry[1].length === dataExactCardinality.Cardinality)
                                    .map(entry => entry[0]))));

        if(dataExactCardinality.Cardinality === 1 && this._functionalDataProperties.has(dataExactCardinality.DataPropertyExpression))
            // Optimise for Functional Data Properties.
            return observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => new Set<any>(dataPropertyExpression.map(member => member[0]))));

        return observableDataPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length === dataExactCardinality.Cardinality)
                    .map(entry => entry[0]))));
    }

    PropertyExpression(
        propertyExpression: IPropertyExpression
        ): Subject<[any, any][]>
    {
        return <Subject<[any, any][]>>this._store.ObserveProperty(propertyExpression.LocalName);
    }

    get ObjectDomain(): Subject<Set<any>>
    {
        return <Subject<Set<any>>>this._store.ObjectDomain;
    }

    ClassExpression(
        classExpression: IClassExpression
        ): Observable<Set<any>>
    {
        return classExpression.Select(this);
    }

    InterpretIndividual(
        individual: object
        ): any
    {
        for(const dataPropertyAssertion of this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression.LocalName === 'Id' &&
                dataPropertyAssertion.SourceIndividual === individual)
                return dataPropertyAssertion.TargetValue;

        return individual;
    }

    private GroupByDomain(
        relations: [any, any][]
        ): Map<any, any[]>
    {
        return Group(
            relations,
            relation => relation[0],
            relation => relation[1]);
    }
}
