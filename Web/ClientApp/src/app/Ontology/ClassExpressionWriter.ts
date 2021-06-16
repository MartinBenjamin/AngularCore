import { IClass } from "./IClass";
import { IClassExpression } from './IClassExpression';
import { IClassExpressionSelector } from './IClassExpressionSelector';
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
import { IPropertyExpression } from './IPropertyExpression';

export class ClassExpressionWriter implements IClassExpressionSelector<string>
{
    Class(class$: IClass): string {
        throw new Error("Method not implemented.");
    }    ObjectIntersectionOf(objectIntersectionOf: IObjectIntersectionOf): string {
        throw new Error("Method not implemented.");
    }
    ObjectUnionOf(objectUnionOf: IObjectUnionOf): string {
        throw new Error("Method not implemented.");
    }
    ObjectComplementOf(objectComplementOf: IObjectComplementOf): string {
        throw new Error("Method not implemented.");
    }
    ObjectOneOf(objectOneOf: IObjectOneOf): string {
        throw new Error("Method not implemented.");
    }
    ObjectSomeValuesFrom(objectSomeValuesFrom: IObjectSomeValuesFrom): string {
        throw new Error("Method not implemented.");
    }
    ObjectAllValuesFrom(objectAllValuesFrom: IObjectAllValuesFrom): string {
        throw new Error("Method not implemented.");
    }
    ObjectHasValue(objectHasValue: IObjectHasValue): string {
        throw new Error("Method not implemented.");
    }
    ObjectHasSelf(objectHasSelf: IObjectHasSelf): string {
        throw new Error("Method not implemented.");
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): string
    {
        return `ObjectMinCardinality${this.ObjectCardinality(objectMinCardinality)}`;
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        ): string
    {
        return `ObjectMaxCardinality${this.ObjectCardinality(objectMaxCardinality)}`;
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        ): string
    {
        return `ObjectExactCardinality${this.ObjectCardinality(objectExactCardinality)}`;
    }

    ObjectCardinality(
        objectCardinality: IObjectCardinality
        ): string
    {
        return `(${objectCardinality.Cardinality} ${this.PropertyExpression(objectCardinality.ObjectPropertyExpression)}${objectCardinality.ClassExpression ? ' ' + objectCardinality.Select(this) : ''})`;
    }

    DataSomeValuesFrom(dataSomeValuesFrom: IDataSomeValuesFrom): string {
        throw new Error("Method not implemented.");
    }
    DataAllValuesFrom(dataAllValuesFrom: IDataAllValuesFrom): string {
        throw new Error("Method not implemented.");
    }
    DataHasValue(dataHasValue: IDataHasValue): string {
        throw new Error("Method not implemented.");
    }
    DataMinCardinality(dataMinCardinality: IDataMinCardinality): string {
        throw new Error("Method not implemented.");
    }
    DataMaxCardinality(dataMaxCardinality: IDataMaxCardinality): string {
        throw new Error("Method not implemented.");
    }
    DataExactCardinality(dataExactCardinality: IDataExactCardinality): string {
        throw new Error("Method not implemented.");
    }

    PropertyExpression(
        propertyExpression: IPropertyExpression
        ): string
    {
        return propertyExpression.LocalName;
    }

    Write(
        classExpression: IClassExpression
        ): string
    {
        return classExpression.Select(this);
    }
}
