import { DataRangeWriter } from "./DataRangeWriter";
import { IClass } from "./IClass";
import { IClassExpression } from './IClassExpression';
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataCardinality, IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IEntity } from './IEntity';
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectCardinality, IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IsAxiom } from "./IsAxiom";

const isAxiom = new IsAxiom();

export class ClassExpressionWriter implements IClassExpressionSelector<string>
{
    private _dataRangeWriter = new DataRangeWriter();

    Class(
        class$: IClass
        ): string
    {
        return `Class(${this.Entity(class$)})`;
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): string
    {
        return `ObjectIntersectionOf(${objectIntersectionOf.ClassExpressions.map(classExpression => classExpression.Select(this)).join(' ')})`;
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        ): string
    {
        return `ObjectUnionOf(${objectUnionOf.ClassExpressions.map(classExpression => classExpression.Select(this)).join(' ')})`;
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        ): string
    {
        return `ObjectComplementOf(${objectComplementOf.ClassExpression.Select(this)})`;
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): string
    {
        const individuals = objectOneOf.Individuals
            .map(individual => this.Individual(individual))
            .join(' ');
        return `ObjectOneOf(${individuals})`;
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        ): string
    {
        return `ObjectSomeValuesFrom(${objectSomeValuesFrom.ClassExpression.Select(this)})`;
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        ): string
    {
        return `ObjectAllValuesFrom(${objectAllValuesFrom.ClassExpression.Select(this)})`;
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): string
    {
        return `ObjectHasValue(${this.Entity(objectHasValue.ObjectPropertyExpression)} ${this.Individual(objectHasValue.Individual)})`;
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): string
    {
        return `ObjectHasSelf(${this.Entity(objectHasSelf.ObjectPropertyExpression)})`;
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

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        ): string
    {
        return `DataSomeValuesFrom(${dataSomeValuesFrom.DataRange.Select(this._dataRangeWriter)})`;
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        ): string
    {
        return `DataAllValuesFrom(${dataAllValuesFrom.DataRange.Select(this._dataRangeWriter)})`;
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): string
    {
        return `DataHasValue(${this.Entity(dataHasValue.DataPropertyExpression)}, ${dataHasValue.Value})`;
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        ): string
    {
        return `DataMinCardinality${this.DataCardinality(dataMinCardinality)}`;
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        ): string
    {
        return `DataMaxCardinality${this.DataCardinality(dataMaxCardinality)}`;
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        ): string
    {
        return `DataExactCardinality${this.DataCardinality(dataExactCardinality)}`;
    }

    DataCardinality(
        dataCardinality: IDataCardinality
        ): string
    {
        return `(\
${dataCardinality.Cardinality} \
${this.Entity(dataCardinality.DataPropertyExpression)}\
${dataCardinality.DataRange ? ' ' + dataCardinality.DataRange.Select(this._dataRangeWriter) : ''})`;
    }

    Individual(
        individual: object
        )
    {
        return isAxiom.INamedIndividual(individual) ? this.Entity(individual) : individual;
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
