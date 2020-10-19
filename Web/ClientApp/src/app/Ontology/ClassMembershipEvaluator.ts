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
import { IObjectPropertyExpression, IDataPropertyExpression } from "./IPropertyExpression";
import { INamedIndividual, IObjectPropertyAssertion, IDataPropertyAssertion } from "./INamedIndividual";
import { IOntology } from "./IOntology";

export class ClassMembershipEvaluator implements IClassMembershipEvaluator
{
    private _ontology: IOntology;
    private _objectPropertyAssertions: Map<INamedIndividual, IObjectPropertyAssertion[]>;
    private _dataPropertyAssertions  : Map<INamedIndividual, IDataPropertyAssertion[]  >;
    private _functionalDataProperties: Set<IDataPropertyExpression>;

    Class(
        class$    : IClass,
        individual: object
        ): boolean
    {
        return false;
    }

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
        return this.ObjectPropertyValues(
            objectMinCardinality.ObjectPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !objectMinCardinality.ClassExpression ||
                    objectMinCardinality.ClassExpression.Evaluate(
                        this,
                        value) ? count + 1 : count,
                0) >= objectMinCardinality.Cardinality;
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality,
        individual          : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectMaxCardinality.ObjectPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !objectMaxCardinality.ClassExpression ||
                    objectMaxCardinality.ClassExpression.Evaluate(
                        this,
                        value) ? count + 1 : count,
                0) <= objectMaxCardinality.Cardinality;
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality,
        individual            : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectExactCardinality.ObjectPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !objectExactCardinality.ClassExpression ||
                    objectExactCardinality.ClassExpression.Evaluate(
                        this,
                        value) ? count + 1 : count,
                0) === objectExactCardinality.Cardinality;
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
        return this.DataPropertyValues(
            dataMinCardinality.DataPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !dataMinCardinality.DataRange ||
                    dataMinCardinality.DataRange.HasMember(value) ? count + 1 : count,
                0) >= dataMinCardinality.Cardinality;
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality,
        individual        : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataMaxCardinality.DataPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !dataMaxCardinality.DataRange ||
                    dataMaxCardinality.DataRange.HasMember(value) ? count + 1 : count,
                0) <= dataMaxCardinality.Cardinality;
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality,
        individual          : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataExactCardinality.DataPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !dataExactCardinality.DataRange ||
                    dataExactCardinality.DataRange.HasMember(value) ? count + 1 : count,
                0) === dataExactCardinality.Cardinality;
    }

    private ObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        individual              : object
        ): object[]
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualObjectPropertyValues(
                objectPropertyExpression,
                individual);

        if(objectPropertyExpression.LocalName in individual)
        {
            let values = individual[objectPropertyExpression.LocalName];
            return Array.isArray(values) ? values : values !== null ? [values] : [];
        }

        return [];
    }

    private DataPropertyValues(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): object[]
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualDataPropertyValues(
                dataPropertyExpression,
                individual);

        if(dataPropertyExpression.LocalName in individual)
        {
            let values = individual[dataPropertyExpression.LocalName];
            return Array.isArray(values) ? values : values !== null ? [values] : [];
        }

        return [];
    }

    private DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): object
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualDataPropertyValue(
                dataPropertyExpression,
                individual);

        return dataPropertyExpression.LocalName in individual ?
            individual[dataPropertyExpression.LocalName] : null;
    }

    private NamedIndividualObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        namedIndividual         : INamedIndividual
        ): object[]
    {
        let objectPropertyAssertions = this._objectPropertyAssertions.get(namedIndividual);
        return objectPropertyAssertions ?
            objectPropertyAssertions
                .filter(objectPropertyAssertion => objectPropertyAssertion.ObjectPropertyExpression === objectPropertyExpression)
                .map(objectPropertyAssertion => objectPropertyAssertion.TargetIndividual) : [];
    }

    private NamedIndividualDataPropertyValues(
        dataPropertyExpression: IDataPropertyExpression,
        namedIndividual       : INamedIndividual
        ): object[]
    {
        let dataPropertyAssertions = this._dataPropertyAssertions.get(namedIndividual);
        return dataPropertyAssertions ?
            dataPropertyAssertions
                .filter(dataPropertyAssertion => dataPropertyAssertion.DataPropertyExpression === dataPropertyExpression)
                .map(dataPropertyAssertion => dataPropertyAssertion.TargetValue) : [];
    }

    private NamedIndividualDataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        namedIndividual       : INamedIndividual
        ): object
    {
        let values = this.NamedIndividualDataPropertyValues(
            dataPropertyExpression,
            namedIndividual);

        return values.length ? values[0] : null;
    }

    private AreEqual(
        lhs: object,
        rhs: object
        ): boolean
    {
        return false;
    }

    private DataPropertyExpressionAreEqual(
        dataPropertyExpression: IDataPropertyExpression,
        lhs: object,
        rhs: object
        ): boolean
    {
        if(this._functionalDataProperties.has(dataPropertyExpression))
            return this.DataPropertyValue(
                dataPropertyExpression,
                lhs) === this.DataPropertyValue(
                    dataPropertyExpression,
                    rhs);
        else
        {
            let lhsValues = new Set<object>(this.DataPropertyValues(
                dataPropertyExpression,
                lhs));
            let rhsValues = new Set<object>(this.DataPropertyValues(
                dataPropertyExpression,
                rhs));

            return lhsValues.size === rhsValues.size &&
                [...lhsValues].every(lhsValue => rhsValues.has(lhsValue));
        }
    }
}
