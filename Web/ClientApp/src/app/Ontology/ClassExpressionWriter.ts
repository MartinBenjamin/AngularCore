import { DataRangeWriter } from "./DataRangeWriter";
import { IClass } from "./IClass";
import { IClassExpression } from './IClassExpression';
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataCardinality, IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataRangeSelector } from "./IDataRangeSelector";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IIndividualSelector } from "./IIndividualSelector";
import { IndividualWriter } from "./IndividualWriter";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectCardinality, IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { IsAxiom } from "./IsAxiom";
import { PropertyExpressionWriter } from "./PropertyExpressionWriter";

const isAxiom = new IsAxiom();

export class ClassExpressionWriter implements IClassExpressionSelector<string>
{
    private _propertyExpressionWriter: IPropertyExpressionSelector<string> = new PropertyExpressionWriter();
    private _dataRangeWriter: IDataRangeSelector<string> = new DataRangeWriter();
    private _individualWriter: IIndividualSelector<string> = new IndividualWriter();

    Class(
        class$: IClass
        ): string
    {
        return class$.Iri;
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
        return `ObjectOneOf(${objectOneOf.Individuals.map(individual => individual.Select(this._individualWriter)).join(' ')})`;
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
        return `ObjectHasValue(${objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionWriter)} ${objectHasValue.Individual.Select(this._individualWriter)})`;
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): string
    {
        return `ObjectHasSelf(${objectHasSelf.ObjectPropertyExpression.Select(this._propertyExpressionWriter)})`;
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
${objectCardinality.ObjectPropertyExpression.Select(this._propertyExpressionWriter)}\
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
        return `DataHasValue(${dataHasValue.DataPropertyExpression.Select(this._propertyExpressionWriter)}, ${dataHasValue.Value})`;
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
${dataCardinality.DataPropertyExpression.Select(this._propertyExpressionWriter)}\
${dataCardinality.DataRange ? ' ' + dataCardinality.DataRange.Select(this._dataRangeWriter) : ''})`;
    }

    Write(
        classExpression: IClassExpression
        ): string
    {
        return classExpression.Select(this);
    }
}
