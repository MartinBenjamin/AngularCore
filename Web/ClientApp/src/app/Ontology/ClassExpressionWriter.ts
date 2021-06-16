import { IClass } from "./IClass";
import { IClassExpression } from './IClassExpression';
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IEntity } from './IEntity';
import { INamedIndividual } from './INamedIndividual';
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectCardinality, IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";

export class ClassExpressionWriter implements IClassExpressionSelector<string>
{
    Class(class$: IClass): string {
        throw new Error("Method not implemented.");
    }
    ObjectIntersectionOf(objectIntersectionOf: IObjectIntersectionOf): string
    {
        throw new Error("Method not implemented.");
    }
    ObjectUnionOf(objectUnionOf: IObjectUnionOf): string {
        throw new Error("Method not implemented.");
    }
    ObjectComplementOf(objectComplementOf: IObjectComplementOf): string {
        throw new Error("Method not implemented.");
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): string
    {
        const individuals = objectOneOf.Individuals
            .map(individual => this.Entity(<INamedIndividual>individual))
            .reduce((previousValue, currentValue) => previousValue + ' ' + currentValue);
        return `ObjectOneOf(${individuals})`;
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
        return `(\
${objectCardinality.Cardinality} \
${this.Entity(objectCardinality.ObjectPropertyExpression)}\
${objectCardinality.ClassExpression ? ' ' + objectCardinality.ClassExpression.Select(this) : ''})`;
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

    Entity(
        entity: IEntity
        ): string
    {
        return entity.LocalName;
    }

    Write(
        classExpression: IClassExpression
        ): string
    {
        return classExpression.Select(this);
    }
}
