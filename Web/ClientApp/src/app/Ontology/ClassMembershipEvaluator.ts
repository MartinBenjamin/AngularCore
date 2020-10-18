import { IClass } from "./IClass";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
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
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { INamedIndividual } from "./INamedIndividual";


function IsNamedIndividual(individual: INamedIndividual | object): individual is INamedIndividual
{
    return (individual as INamedIndividual).Ontology !== undefined;
}

export class ClassMembershipEvaluator implements IClassMembershipEvaluator
{
    Class                 (class$                : IClass                 , individual: object): boolean { return false; }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf,
        individual          : object
        ): boolean
    {
        return objectIntersectionOf.ClassExpressions.every(classExpression => classExpression.Evaluate(
            this,
            individual));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf,
        individual   : object
        ): boolean
    {
        return objectUnionOf.ClassExpressions.some(classExpression => classExpression.Evaluate(
            this,
            individual));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf,
        individual        : object
        ): boolean
    {
        return !objectComplementOf.ClassExpression.Evaluate(
            this,
            individual);
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf,
        individual : object
        ): boolean
    {
        return objectOneOf.Individuals.some(
            member => this.AreEqual(
                individual,
                member));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom,
        individual          : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectSomeValuesFrom.ObjectPropertyExpression,
            individual).some(
                value => objectSomeValuesFrom.ClassExpression.Evaluate(
                    this,
                    value));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom,
        individual         : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectAllValuesFrom.ObjectPropertyExpression,
            individual).every(
                value => objectAllValuesFrom.ClassExpression.Evaluate(
                    this,
                    value));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue,
        individual    : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectHasValue.ObjectPropertyExpression,
            individual).some(
                value => this.AreEqual(
                    objectHasValue.Individual,
                    value));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf,
        individual   : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectHasSelf.ObjectPropertyExpression,
            individual).some(
                value => this.AreEqual(
                    individual,
                    value));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality,
        individual          : object
        ): boolean
    {
        let values = this.ObjectPropertyValues(
            objectMinCardinality.ObjectPropertyExpression,
            individual);

        if(objectMinCardinality.ClassExpression)
            values = values.filter(value => objectMinCardinality.ClassExpression.Evaluate(
                this,
                value));

        return values.length >= objectMinCardinality.Cardinality;
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality,
        individual          : object
        ): boolean
    {
        let values = this.ObjectPropertyValues(
            objectMaxCardinality.ObjectPropertyExpression,
            individual);

        if(objectMaxCardinality.ClassExpression)
            values = values.filter(value => objectMaxCardinality.ClassExpression.Evaluate(
                this,
                value));

        return values.length <= objectMaxCardinality.Cardinality;
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality,
        individual            : object
        ): boolean
    {
        let values = this.ObjectPropertyValues(
            objectExactCardinality.ObjectPropertyExpression,
            individual);

        if(objectExactCardinality.ClassExpression)
            values = values.filter(value => objectExactCardinality.ClassExpression.Evaluate(
                this,
                value));

        return values.length === objectExactCardinality.Cardinality;
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom,
        individual        : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataSomeValuesFrom.DataPropertyExpression,
            individual).some(dataSomeValuesFrom.DataRange.HasMember);
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom,
        individual       : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataAllValuesFrom.DataPropertyExpression,
            individual).every(dataAllValuesFrom.DataRange.HasMember);
    }

    DataHasValue(
        dataHasValue: IDataHasValue,
        individual  : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataHasValue.DataPropertyExpression,
            individual).indexOf(dataHasValue.Value) != -1;
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality,
        individual        : object
        ): boolean
    {
        let values = this.DataPropertyValues(
            dataMinCardinality.DataPropertyExpression,
            individual);

        if(dataMinCardinality.DataRange)
            values = values.filter(value => dataMinCardinality.DataRange.HasMember(value));

        return values.length >= dataMinCardinality.Cardinality;
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality,
        individual        : object
        ): boolean
    {
        let values = this.DataPropertyValues(
            dataMaxCardinality.DataPropertyExpression,
            individual);

        if(dataMaxCardinality.DataRange)
            values = values.filter(value => dataMaxCardinality.DataRange.HasMember(value));

        return values.length <= dataMaxCardinality.Cardinality;
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality,
        individual          : object
        ): boolean
    {
        let values = this.DataPropertyValues(
            dataExactCardinality.DataPropertyExpression,
            individual);

        if(dataExactCardinality.DataRange)
            values = values.filter(value => dataExactCardinality.DataRange.HasMember(value));

        return values.length === dataExactCardinality.Cardinality;
    }

    private ObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        individual              : object
        ): object[]
    {
        return null;
    }

    private DataPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        individual              : object
        ): object[]
    {
        return null;
    }

    private AreEqual(
        lhs: object,
        rhs: object
        ): boolean
    {
        return false;
    }
}
