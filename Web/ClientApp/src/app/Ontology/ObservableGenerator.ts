import { BehaviorSubject, Observable } from "rxjs";
import { Group } from "./ClassMembershipEvaluator";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataHasValue } from "./IDataHasValue";
import { count } from "rxjs/operator/count";

function Intersect(
    lhs: Set<object>,
    rhs: Set<object>
    )
{
    return new Set<object>([...lhs].filter(member => rhs.has(member)));
}

function Union(
    lhs: Set<object>,
    rhs: Set<object>
    )
{
    let union = new Set<object>(lhs);
    rhs.forEach(member => union.add(member));
    return union;
}

export class ObservableGenerator implements IClassExpressionVisitor
{
    private _observableClassExpressions        : Map<IClassExpression         , Observable<Set<object>>>;
    private _observableObjectPropertyExpression: Map<IObjectPropertyExpression, Observable<Array<[object, IObjectPropertyExpression, object]>>>;
    private _observableDataPropertyExpression  : Map<IDataPropertyExpression  , Observable<Array<[object, IDataPropertyExpression  , any   ]>>>;
    private _observableObjectDomain            : Observable<Set<object>>;

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
            observables.reduce((accumulator, currentValue) => accumulator.combineLatest(currentValue, Intersect)));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        )
    {
        let observables = objectUnionOf.ClassExpressions.map(classExpression => this._observableClassExpressions.get(classExpression));
        this._observableClassExpressions.set(
            objectUnionOf,
            observables.reduce((accumulator, currentValue) => accumulator.combineLatest(currentValue, Union)));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        )
    {
        this._observableClassExpressions.set(
            objectComplementOf,
            this._observableObjectDomain.combineLatest(
                this._observableClassExpressions.get(objectComplementOf.ClassExpression),
                (objectDomain, classExpression) => new Set<object>([...objectDomain].filter(member => !classExpression.has(member)))));
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        )
    {
        this._observableClassExpressions.set(
            objectOneOf,
            new BehaviorSubject<Set<object>>(new Set<object>(objectOneOf.Individuals)));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        )
    {
        this._observableClassExpressions.set(
            objectSomeValuesFrom,
            this._observableObjectPropertyExpression.get(objectSomeValuesFrom.ObjectPropertyExpression)
            .combineLatest(
                this._observableClassExpressions.get(objectSomeValuesFrom.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    new Set<object>(
                        [...objectPropertyExpression]
                            .filter(member => classExpression.has(member[2]))
                            .map(member => member[0]))));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        )
    {
        let observableGroupedByDomain = this._observableObjectPropertyExpression.get(objectAllValuesFrom.ObjectPropertyExpression).map(
            objectPropertyExpression => Group(
                objectPropertyExpression,
                member => member[0],
                member => member[2]));

        this._observableClassExpressions.set(
            objectAllValuesFrom,
            observableGroupedByDomain
                .combineLatest(
                    this._observableClassExpressions.get(objectAllValuesFrom.ClassExpression),
                    (groupedByDomain, classExpression) =>
                        new Set<object>(
                            [...groupedByDomain.entries()]
                                .filter(entry => entry[1].every(individual => classExpression.has(individual)))
                                .map(entry => entry[0]))));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        )
    {
        this._observableClassExpressions.set(
            objectHasValue,
            new BehaviorSubject<Set<object>>(new Set<object>().add(objectHasValue.Individual)));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        )
    {
        throw new Error("Method not implemented.");
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        )
    {
        let observableObjectPropertyExpression = this._observableObjectPropertyExpression.get(objectMinCardinality.ObjectPropertyExpression);
        if(objectMinCardinality.ClassExpression)
            observableObjectPropertyExpression = observableObjectPropertyExpression.combineLatest(
                this._observableClassExpressions.get(objectMinCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[2])));

        let observableGroupedByDomain = observableObjectPropertyExpression.map(
            objectPropertyExpression => Group(
                objectPropertyExpression,
                member => member[0],
                member => member[2]));

        //this._observableClassExpressions.set(
        //    objectMinCardinality,
        //    observableGroupedByDomain.combineLatest(
        //        this._observableClassExpressions.get(objectMinCardinality.ClassExpression),
        //        (groupedByDomain, classExpression) =>
        //            new Set([...groupedByDomain.entries()]
        //                .filter(entry => entry[1].reduce(
        //                    (count, individual) => classExpression.has(individual) ? count + 1 : count,
        //                    0) >= objectMinCardinality.Cardinality)
        //                .map(entry => entry[0]))));

        if(objectMinCardinality.Cardinality > 0)
            this._observableClassExpressions.set(
                objectMinCardinality,
                observableGroupedByDomain.map(
                    groupedByDomain =>
                        new Set([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length >= objectMinCardinality.Cardinality)
                            .map(entry => entry[0]))));

        else
            this._observableClassExpressions.set(
                objectMinCardinality,
                this._observableObjectDomain.map(objectDomain => new Set(objectDomain)));
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        )
    {
        throw new Error("Method not implemented.");
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        )
    {
        throw new Error("Method not implemented.");
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        )
    {
        throw new Error("Method not implemented.");
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        )
    {
        throw new Error("Method not implemented.");
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        )
    {
        throw new Error("Method not implemented.");
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        )
    {
        let observableDataPropertyExpression = this._observableDataPropertyExpression.get(dataMinCardinality.DataPropertyExpression);
        if(dataMinCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.map(
                dataPropertyExpression => dataPropertyExpression.filter(member => dataMinCardinality.DataRange.HasMember(member[2])));

        let observableGroupedByDomain = observableDataPropertyExpression.map(
            dataPropertyExpression => Group(
                dataPropertyExpression,
                member => member[0],
                member => member[2]));

        if(dataMinCardinality.Cardinality > 0)
            this._observableClassExpressions.set(
                dataMinCardinality,
                observableGroupedByDomain.map(
                    groupedByDomain =>
                        new Set([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length >= dataMinCardinality.Cardinality)
                            .map(entry => entry[0]))));

        else
            this._observableClassExpressions.set(
                dataMinCardinality,
                this._observableObjectDomain.map(objectDomain => new Set(objectDomain)));
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        )
    {
        let observableDataPropertyExpression = this._observableDataPropertyExpression.get(dataMaxCardinality.DataPropertyExpression);
        if(dataMaxCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.map(
                dataPropertyExpression => dataPropertyExpression.filter(member => dataMaxCardinality.DataRange.HasMember(member[2])));

        let observableGroupedByDomain = observableDataPropertyExpression.map(
            dataPropertyExpression => Group(
                dataPropertyExpression,
                member => member[0],
                member => member[2]));

        if(dataMaxCardinality.Cardinality > 0)
            this._observableClassExpressions.set(
                dataMaxCardinality,
                observableGroupedByDomain.map(
                    groupedByDomain =>
                        new Set([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length <= dataMaxCardinality.Cardinality)
                            .map(entry => entry[0]))));

        else
            this._observableClassExpressions.set(
                dataMaxCardinality,
                this._observableObjectDomain.combineLatest(
                    observableGroupedByDomain,
                    (objectDomain, groupedByDomain) =>
                        new Set([...objectDomain].filter(individual => !groupedByDomain.has(individual)))));
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        )
    {
        let observableDataPropertyExpression = this._observableDataPropertyExpression.get(dataExactCardinality.DataPropertyExpression);
        if(dataExactCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.map(
                dataPropertyExpression => dataPropertyExpression.filter(member => dataExactCardinality.DataRange.HasMember(member[2])));

        let observableGroupedByDomain = observableDataPropertyExpression.map(
            dataPropertyExpression => Group(
                dataPropertyExpression,
                member => member[0],
                member => member[2]));

        if(dataExactCardinality.Cardinality > 0)
            this._observableClassExpressions.set(
                dataExactCardinality,
                observableGroupedByDomain.map(
                    groupedByDomain => new Set([...groupedByDomain.entries()]
                        .filter(entry => entry[1].length === dataExactCardinality.Cardinality)
                        .map(entry => entry[0]))));

        else
            this._observableClassExpressions.set(
              dataExactCardinality,
              this._observableObjectDomain.combineLatest(
                  observableGroupedByDomain,
                  (objectDomain, groupedByDomain) =>
                      new Set([...objectDomain].filter(individual => !groupedByDomain.has(individual)))));
    }
}
