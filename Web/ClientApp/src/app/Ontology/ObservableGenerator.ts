import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { Group } from './Group';
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
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
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";

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

export function GroupByDomain(
    relations: Iterable<[any, any]>
    ): Map<any, Set<any>>
{
    let map = new Map<any, Set<any>>();
    for(let relation of relations)
    {
        let values = map.get(relation[0]);
        if(values)
            values.add(relation[1]);

        else
            map.set(
                relation[0],
                new Set<any>().add(relation[1]));
    }
    return map;
}

export function GroupJoin<TLeft, TRight, TKey>(
    leftIterable    : Iterable<TLeft>,
    rightIterable   : Iterable<TRight>,
    leftKeySelector : (left: TLeft) => TKey,
    rightKeySelector: (right: TRight) => TKey
    ): Map<TLeft, TRight[]
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
    ObjectPropertyExpression(objectPropertyExpression: IObjectPropertyExpression): Observable<[any, any][]>;
    DataPropertyExpression(dataPropertyExpression: IDataPropertyExpression): Observable<[any, any][]>;
}

export class Store implements IStore
{
    ObjectDomain: Observable<Set<any>>;

    ObjectPropertyExpression(
        objectPropertyExpression: IObjectPropertyExpression
        ): Observable<[any, any][]>
    {
        throw new Error("Method not implemented.");
    }

    DataPropertyExpression(
        dataPropertyExpression: IDataPropertyExpression
        ): Observable<[any, any][]>
    {
        throw new Error("Method not implemented.");
    }
}

class StoreDecorator implements IStore
{
    constructor(
        private _ontology : IOntology,
        private _decorated: IStore
        )
    {
    }

    get ObjectDomain(): Observable<Set<any>>
    {
        const individuals = [...this._ontology.Get(this._ontology.IsAxiom.INamedIndividual)];

        if(!individuals.length)
            return this._decorated.ObjectDomain;

        else
            return combineLatest(
                this._decorated.ObjectDomain,
                new BehaviorSubject<any[]>(individuals.map(individual => this.InterpretIndividual(individual))),
                (lhs, rhs) => new Set<any>([...lhs, ...rhs]));
    }

    ObjectPropertyExpression(
        objectPropertyExpression: IObjectPropertyExpression
        ): Observable<[any, any][]>
    {
        const objectPropertyAssertions = [...this._ontology.Get(this._ontology.IsAxiom.IObjectPropertyAssertion)]
            .filter(objectPropertyAssertion => objectPropertyAssertion.ObjectPropertyExpression === objectPropertyExpression);

        if(!objectPropertyAssertions.length)
            return this._decorated.ObjectPropertyExpression(objectPropertyExpression);

        return combineLatest(
            this._decorated.ObjectPropertyExpression(objectPropertyExpression),
            new BehaviorSubject<[any, any][]>(objectPropertyAssertions.map(objectPropertyAssertion =>
                [this.InterpretIndividual(objectPropertyAssertion.SourceIndividual),
                this.InterpretIndividual(objectPropertyAssertion.TargetIndividual)])),
            (lhs, rhs) =>
            {
                const map = GroupByDomain(lhs);
                const combined = [].concat(lhs);
                for(const relation of rhs)
                {
                    var values = map.get(relation[0])
                    if(!values)
                    {
                        values = new Set<any>().add(relation[1]);
                        map.set(
                            relation[0],
                            values);
                        combined.push(relation);
                    }
                    else if(!values.has(relation[1]))
                    {
                        values.add(relation[1]);
                        combined.push(relation);
                    }
                }
                return combined;
            });
    }

    DataPropertyExpression(
        dataPropertyExpression: IDataPropertyExpression
        ): Observable<[any, any][]>
    {
        const dataPropertyAssertions = [...this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion)]
            .filter(dataPropertyAssertion => dataPropertyAssertion.DataPropertyExpression === dataPropertyExpression);

        if(!dataPropertyAssertions.length)
            return this._decorated.DataPropertyExpression(dataPropertyExpression);

        return combineLatest(
            this._decorated.DataPropertyExpression(dataPropertyExpression),
            new BehaviorSubject<[any, any][]>(dataPropertyAssertions.map(dataPropertyAssertion =>
                [this.InterpretIndividual(dataPropertyAssertion.SourceIndividual), dataPropertyAssertion.TargetValue])),
            (lhs, rhs) =>
            {
                const map = GroupByDomain(lhs);
                const combined = [].concat(lhs);
                for(const relation of rhs)
                {
                    var values = map.get(relation[0])
                    if(!values)
                    {
                        values = new Set<any>().add(relation[1]);
                        map.set(
                            relation[0],
                            values);
                        combined.push(relation);
                    }
                    else if(!values.has(relation[1]))
                    {
                        values.add(relation[1]);
                        combined.push(relation);
                    }
                }
                return lhs;
            });
    }
    
    private InterpretIndividual(
        individual: object
        ): any
    {
        for(const dataPropertyAssertion of this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression.LocalName === "Id" &&
                dataPropertyAssertion.SourceIndividual === individual)
                return dataPropertyAssertion.TargetValue;

        return individual;
    }
}

export class ObservableGenerator implements IClassExpressionVisitor
{
    private _observableClassExpressions: Map<IClassExpression, Observable<Set<any>>>;
    private _store                     : IStore;

    constructor(
        private _ontology: IOntology,
        store            : IStore
        )
    {
        this._store = new StoreDecorator(
            _ontology,
            store);
    }

    Class(
        class$: IClass
        )
    {
        throw new Error("Method not implemented.");
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        )
    {
        this._observableClassExpressions.set(
            objectIntersectionOf,
            combineLatest(
                objectIntersectionOf.ClassExpressions.map(classExpression => this._observableClassExpressions.get(classExpression)),
                (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs]))));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        )
    {
        this._observableClassExpressions.set(
            objectUnionOf,
            combineLatest(
                objectUnionOf.ClassExpressions.map(classExpression => this._observableClassExpressions.get(classExpression)),
                (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs].filter(member => rhs.has(member))))));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        )
    {
        this._observableClassExpressions.set(
            objectComplementOf,
            combineLatest(
                this._store.ObjectDomain,
                this._observableClassExpressions.get(objectComplementOf.ClassExpression),
                (objectDomain, classExpression) => new Set<any>([...objectDomain].filter(member => !classExpression.has(member)))));
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        )
    {
        this._observableClassExpressions.set(
            objectOneOf,
            new BehaviorSubject<Set<any>>(new Set<any>(objectOneOf.Individuals.map(individual => this.InterpretIndividual(individual)))));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        )
    {
        this._observableClassExpressions.set(
            objectSomeValuesFrom,
            combineLatest(
                this._store.ObjectPropertyExpression(objectSomeValuesFrom.ObjectPropertyExpression),
                this._observableClassExpressions.get(objectSomeValuesFrom.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    new Set<any>(
                        objectPropertyExpression
                            .filter(member => classExpression.has(member[1]))
                            .map(member => member[0]))));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        )
    {
        this._observableClassExpressions.set(
            objectAllValuesFrom,
            combineLatest(
                this._store.ObjectPropertyExpression(objectAllValuesFrom.ObjectPropertyExpression).pipe(map(this.GroupByDomain)),
                this._observableClassExpressions.get(objectAllValuesFrom.ClassExpression),
                (groupedByDomain, classExpression) =>
                    new Set<any>(
                        [...groupedByDomain.entries()]
                            .filter(entry => entry[1].every(individual => classExpression.has(individual)))
                            .map(entry => entry[0]))));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        )
    {
        const individual = this.InterpretIndividual(objectHasValue.Individual);
        this._observableClassExpressions.set(
            objectHasValue,
            this._store.ObjectPropertyExpression(objectHasValue.ObjectPropertyExpression).pipe(
                map(objectPropertyExpression =>
                    new Set<any>(objectPropertyExpression
                        .filter(member => member[1] === individual)
                        .map(member => member[0])))));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        )
    {
        this._observableClassExpressions.set(
            objectHasSelf,
            this._store.ObjectPropertyExpression(objectHasSelf.ObjectPropertyExpression).pipe(
                map(objectPropertyExpression =>
                    new Set<any>(objectPropertyExpression
                        .filter(member => member[0] === member[1])
                        .map(member => member[0])))));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        )
    {
        if(objectMinCardinality.Cardinality === 0)
        {
            // All individuals.
            this._observableClassExpressions.set(
                objectMinCardinality,
                this._store.ObjectDomain);

            return;
        }

        let observableObjectPropertyExpression = this._store.ObjectPropertyExpression(objectMinCardinality.ObjectPropertyExpression);
        if(objectMinCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this._observableClassExpressions.get(objectMinCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        this._observableClassExpressions.set(
            objectMinCardinality,
            observableObjectPropertyExpression.pipe(
                map(this.GroupByDomain),
                map(groupedByDomain =>
                    new Set<any>([...groupedByDomain.entries()]
                        .filter(entry => entry[1].length >= objectMinCardinality.Cardinality)
                        .map(entry => entry[0])))));
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        )
    {
        let observableObjectPropertyExpression = this._store.ObjectPropertyExpression(objectMaxCardinality.ObjectPropertyExpression);
        if(objectMaxCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this._observableClassExpressions.get(objectMaxCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        if(objectMaxCardinality.Cardinality == 0)
            this._observableClassExpressions.set(
                objectMaxCardinality,
                combineLatest(
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
                                        .map(entry => entry[0])))));
        else
            this._observableClassExpressions.set(
                objectMaxCardinality,
                observableObjectPropertyExpression.pipe(
                    map(this.GroupByDomain),
                    map(groupedByDomain =>
                        new Set<any>([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length <= objectMaxCardinality.Cardinality)
                            .map(entry => entry[0])))));
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        )
    {
        let observableObjectPropertyExpression = this._store.ObjectPropertyExpression(objectExactCardinality.ObjectPropertyExpression);
        if(objectExactCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this._observableClassExpressions.get(objectExactCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        if(objectExactCardinality.Cardinality == 0)
            this._observableClassExpressions.set(
                objectExactCardinality,
                combineLatest(
                    this._store.ObjectDomain,
                    observableObjectPropertyExpression,
                    (objectDomain, objectPropertyExpression) =>
                        GroupJoin(
                            objectDomain,
                            objectPropertyExpression,
                            individual => individual,
                            relation => relation[0])).pipe(
                                map(groupedByDomain =>
                                    new Set<any>([...groupedByDomain.entries()]
                                        .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                                        .map(entry => entry[0])))));
        else
            this._observableClassExpressions.set(
                objectExactCardinality,
                observableObjectPropertyExpression.pipe(
                    map(this.GroupByDomain),
                    map(groupedByDomain =>
                        new Set<any>([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                            .map(entry => entry[0])))));
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        )
    {
        this._observableClassExpressions.set(
            dataSomeValuesFrom,
            this._store.DataPropertyExpression(dataSomeValuesFrom.DataPropertyExpression).pipe(
                map(dataPropertyExpression =>
                    new Set<any>(dataPropertyExpression
                        .filter(member => dataSomeValuesFrom.DataRange.HasMember(member[1]))))));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        )
    {
        this._observableClassExpressions.set(
            dataAllValuesFrom,
            this._store.DataPropertyExpression(dataAllValuesFrom.DataPropertyExpression).pipe(
                map(this.GroupByDomain),
                map(groupedByDomain =>
                    new Set<any>(
                        [...groupedByDomain.entries()]
                            .filter(entry => entry[1].every(value => dataAllValuesFrom.DataRange.HasMember(value)))
                            .map(entry => entry[0])))));
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        )
    {
        this._observableClassExpressions.set(
            dataHasValue,
            this._store.DataPropertyExpression(dataHasValue.DataPropertyExpression).pipe(
                map(dataPropertyExpression =>
                    new Set<any>(dataPropertyExpression
                        .filter(member => member[1] === dataHasValue.Value)
                        .map(member => member[0])))));
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        )
    {
        throw new Error("Method not implemented.");
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        )
    {
        throw new Error("Method not implemented.");
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        )
    {
        throw new Error("Method not implemented.");
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


    private InterpretIndividual(
        individual: object
        ): any
    {
        for(const dataPropertyAssertion of this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression.LocalName === "Id" &&
                dataPropertyAssertion.SourceIndividual === individual)
                return dataPropertyAssertion.TargetValue;

        return individual;
    }
}
