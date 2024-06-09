import { DataRangeWriter } from "./DataRangeWriter";
import { IClass } from "./IClass";
import { IClassExpression } from './IClassExpression';
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataCardinality, IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IEntity } from './IEntity';
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
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from './IProperty';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { IsAxiom } from "./IsAxiom";

const isAxiom = new IsAxiom();

export class ClassExpressionWriter implements
    IClassExpressionSelector<string>,
    IPropertyExpressionSelector<string>
{
    private _dataRangeWriter  = new DataRangeWriter();
    private _individualWriter = new IndividualWriter();

    Class(
        class$: IClass
        ): string
    {
        return this.Entity(class$);
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
            .map(individual => individual.Select(this._individualWriter))
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
        return `ObjectHasValue(${objectHasValue.ObjectPropertyExpression.Select(this)} ${objectHasValue.Individual.Select(this._individualWriter)})`;
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): string
    {
        return `ObjectHasSelf(${objectHasSelf.ObjectPropertyExpression.Select(this)})`;
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
${objectCardinality.ObjectPropertyExpression.Select(this)}\
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
        return `DataHasValue(${dataHasValue.DataPropertyExpression.Select(this)}, ${dataHasValue.Value})`;
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
${dataCardinality.DataPropertyExpression.Select(this)}\
${dataCardinality.DataRange ? ' ' + dataCardinality.DataRange.Select(this._dataRangeWriter) : ''})`;
    }
    
    ObjectProperty(
        objectProperty: IObjectProperty
        ): string
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): string
    {
        return this.Property(dataProperty);
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): string
    {
        return `InverseObjectProperty(${inverseObjectProperty.ObjectProperty.Select(this)})`;
    }

    private Property(
        property: IProperty
        )
    {
        return this.Entity(property);
    }

    Entity(
        entity: IEntity
        ): string
    {
        return entity.Iri;
    }

    Write(
        classExpression: IClassExpression
        ): string
    {
        return classExpression.Select(this);
    }
}
