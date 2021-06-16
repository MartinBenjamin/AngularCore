import { IClass } from "./IClass";
import { IClassExpressionVisitor } from './IClassExpressionVisitor';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectCardinality, IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IClassExpression } from './IClassExpression';

export class ClassExpressionWriter implements IClassExpressionVisitor
{
    private _output: string;

    Class(class$: IClass): void {
        throw new Error("Method not implemented.");
    }

    ObjectIntersectionOf(objectIntersectionOf: IObjectIntersectionOf): void
    {
        throw new Error("Method not implemented.");
    }
    ObjectUnionOf(objectUnionOf: IObjectUnionOf): void {
        throw new Error("Method not implemented.");
    }
    ObjectComplementOf(objectComplementOf: IObjectComplementOf): void {
        throw new Error("Method not implemented.");
    }
    ObjectOneOf(objectOneOf: IObjectOneOf): void {
        throw new Error("Method not implemented.");
    }
    ObjectSomeValuesFrom(objectSomeValuesFrom: IObjectSomeValuesFrom): void {
        throw new Error("Method not implemented.");
    }
    ObjectAllValuesFrom(objectAllValuesFrom: IObjectAllValuesFrom): void {
        throw new Error("Method not implemented.");
    }
    ObjectHasValue(objectHasValue: IObjectHasValue): void {
        throw new Error("Method not implemented.");
    }
    ObjectHasSelf(objectHasSelf: IObjectHasSelf): void {
        throw new Error("Method not implemented.");
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): void
    {
        this._output += 'ObjectMinCardinality';
        this.ObjectCardinality(objectMinCardinality);
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        ): void
    {
        this._output += 'ObjectMaxCardinality';
        this.ObjectCardinality(objectMaxCardinality);
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        ): void
    {
        this._output += 'ObjectExactCardinality(';
        this.ObjectCardinality(objectExactCardinality);
    }

    ObjectCardinality(
        objectCardinality: IObjectCardinality
        )
    {
        this._output += '(';
        this._output += objectCardinality.Cardinality;
        this._output += ' ';
        this._output += objectCardinality.ObjectPropertyExpression.LocalName;
        if(objectCardinality.ClassExpression)
        {
            this._output += ' ';
            objectCardinality.Accept(this);
        }
        this._output += ')';
    }

    DataSomeValuesFrom(dataSomeValuesFrom: IDataSomeValuesFrom): void {
        throw new Error("Method not implemented.");
    }
    DataAllValuesFrom(dataAllValuesFrom: IDataAllValuesFrom): void {
        throw new Error("Method not implemented.");
    }
    DataHasValue(dataHasValue: IDataHasValue): void {
        throw new Error("Method not implemented.");
    }
    DataMinCardinality(dataMinCardinality: IDataMinCardinality): void {
        throw new Error("Method not implemented.");
    }
    DataMaxCardinality(dataMaxCardinality: IDataMaxCardinality): void {
        throw new Error("Method not implemented.");
    }
    DataExactCardinality(dataExactCardinality: IDataExactCardinality): void {
        throw new Error("Method not implemented.");
    }

    Write(
        classExpression: IClassExpression
        ): string
    {
        this._output = '';
        classExpression.Accept(this);
        return this._output;
    }
}
