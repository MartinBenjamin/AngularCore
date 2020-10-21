import { IClass } from "./IClass";
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

export class ClassExpressionNavigator implements IClassExpressionVisitor
{
    private readonly _enter: IClassExpressionVisitor;
    private readonly _exit : IClassExpressionVisitor;

    constructor(
        enter: IClassExpressionVisitor,
        exit?: IClassExpressionVisitor
        )
    {
        this._enter = enter;
        this._exit  = exit;
    }

    Class(
        class$: IClass
        )
    {
        if(this._enter)
            this._enter.Class(class$);

        if(this._exit)
            this._exit.Class(class$);
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        )
    {
        if(this._enter)
            this._enter.ObjectIntersectionOf(objectIntersectionOf);

        objectIntersectionOf.ClassExpressions.forEach(
            classExpression => classExpression.Accept(this));

        if(this._exit)
            this._exit.ObjectIntersectionOf(objectIntersectionOf);
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        )
    {
        if(this._enter)
            this._enter.ObjectUnionOf(objectUnionOf);

        objectUnionOf.ClassExpressions.forEach(
            classExpression => classExpression.Accept(this));

        if(this._exit)
            this._exit.ObjectUnionOf(objectUnionOf);
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        )
    {
        if(this._enter)
            this._enter.ObjectComplementOf(objectComplementOf);

        objectComplementOf.ClassExpression.Accept(this);

        if(this._exit)
            this._exit.ObjectComplementOf(objectComplementOf);
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        )
    {
        if(this._enter)
            this._enter.ObjectOneOf(objectOneOf);

        if(this._exit)
            this._exit.ObjectOneOf(objectOneOf);
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        )
    {
        if(this._enter)
            this._enter.ObjectSomeValuesFrom(objectSomeValuesFrom);

        objectSomeValuesFrom.ClassExpression.Accept(this);

        if(this._exit)
            this._exit.ObjectSomeValuesFrom(objectSomeValuesFrom);
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        )
    {
        if(this._enter)
            this._enter.ObjectAllValuesFrom(objectAllValuesFrom);

        objectAllValuesFrom.ClassExpression.Accept(this);

        if(this._exit)
            this._exit.ObjectAllValuesFrom(objectAllValuesFrom);
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        )
    {
        if(this._enter)
            this._enter.ObjectHasValue(objectHasValue);

        if(this._exit)
            this._exit.ObjectHasValue(objectHasValue);
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        )
    {
        if(this._enter)
            this._enter.ObjectHasSelf(objectHasSelf);

        if(this._exit)
            this._exit.ObjectHasSelf(objectHasSelf);
    }

    ObjectMinCardinality(objectMinCardinality: IObjectMinCardinality) { }
    ObjectMaxCardinality(objectMaxCardinality: IObjectMaxCardinality) { }
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality) { }
    DataSomeValuesFrom(dataSomeValuesFrom: IDataSomeValuesFrom) { }
    DataAllValuesFrom(dataAllValuesFrom: IDataAllValuesFrom) { }
    DataHasValue(dataHasValue: IDataHasValue) { }
    DataMinCardinality(dataMinCardinality: IDataMinCardinality) { }
    DataMaxCardinality(dataMaxCardinality: IDataMaxCardinality) { }
    DataExactCardinality(dataExactCardinality: IDataExactCardinality) { }

}
