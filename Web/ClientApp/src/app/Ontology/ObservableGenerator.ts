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

export class ObservableGenerator implements IClassExpressionVisitor
{
    private _ontology                  : IOntology;
    private _observableClassExpressions: Map<IClassExpression, Observable<Set<any>>>;
    private _store                     : IStore;

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
        let observables = objectIntersectionOf.ClassExpressions.map(classExpression => this._observableClassExpressions.get(classExpression));
        this._observableClassExpressions.set(
            objectIntersectionOf,
            combineLatest(observables, (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs]))));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        )
    {
        let observables = objectUnionOf.ClassExpressions.map(classExpression => this._observableClassExpressions.get(classExpression));
        this._observableClassExpressions.set(
            objectUnionOf,
            combineLatest(observables, (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs].filter(member => rhs.has(member))))));
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
            new BehaviorSubject<Set<any>>(new Set<any>([...objectOneOf.Individuals.map(individual => this.InterpretIndividual(individual))])));
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
        const observableGroupedByDomain = this._store.ObjectPropertyExpression(objectAllValuesFrom.ObjectPropertyExpression).pipe(map(
            objectPropertyExpression => Group(
                objectPropertyExpression,
                member => member[0],
                member => member[1])));

        this._observableClassExpressions.set(
            objectAllValuesFrom,
            combineLatest(
                observableGroupedByDomain,
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
        const observableObjectPropertyExpression = this._store.ObjectPropertyExpression(objectHasSelf.ObjectPropertyExpression);
        this._observableClassExpressions.set(
            objectHasSelf,
            observableObjectPropertyExpression.pipe(
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
                map(objectPropertyExpression => Group(
                    objectPropertyExpression,
                    member => member[0],
                    member => member[1])),
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
                    map(objectPropertyExpression => Group(
                        objectPropertyExpression,
                        member => member[0],
                        member => member[1])),
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
                    map(objectPropertyExpression => Group(
                        objectPropertyExpression,
                        member => member[0],
                        member => member[1])),
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
                map(dataPropertyExpression => Group(
                    dataPropertyExpression,
                    member => member[0],
                    member => member[1])),
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
