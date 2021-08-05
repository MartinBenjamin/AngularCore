import { Group } from "./Group";
import { IIndividual } from "./IIndividual";
import { IDataPropertyAssertion, INamedIndividual, IObjectPropertyAssertion } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export interface IStore
{
    ObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        individual              : object): object[];

    DataPropertyValues(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object): any[]

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        individual: object
        ): any
}

export class Store implements IStore
{
    ObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        individual              : object
        ): object[]
    {
        return this.PropertyValues(
            objectPropertyExpression,
            individual);
    }

    DataPropertyValues(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): any[]
    {
        return this.PropertyValues(
            dataPropertyExpression,
            individual);
    }

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): any
    {
        return dataPropertyExpression.LocalName in individual ?
            individual[dataPropertyExpression.LocalName] : null;
    }

    private PropertyValues(
        propertyExpression: IPropertyExpression,
        individual        : object
        ): any[]
    {
        if(propertyExpression.LocalName in individual)
        {
            let value = individual[propertyExpression.LocalName];
            return Array.isArray(value) ?
                value : value !== null ?
                    (typeof value[Symbol.iterator] !== 'undefined' && typeof value === 'object' ? [...value] : [value]) : [];
        }

        return [];
    }
}

export class StoreDecorator implements IStore
{
    private readonly _objectPropertyAssertions: Map<IIndividual, IObjectPropertyAssertion[]>;
    private readonly _dataPropertyAssertions  : Map<IIndividual, IDataPropertyAssertion[]>;

    constructor(
        private _ontology : IOntology,
        private _decorated: IStore
        )
    {
        this._objectPropertyAssertions = Group(
            this._ontology.Get(this._ontology.IsAxiom.IObjectPropertyAssertion),
            objectPropertyAssertion => objectPropertyAssertion.SourceIndividual,
            objectPropertyAssertion => objectPropertyAssertion);
        this._dataPropertyAssertions = Group(
            this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion),
            dataPropertyAssertion => dataPropertyAssertion.SourceIndividual,
            dataPropertyAssertion => dataPropertyAssertion);
    }

    ObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        individual              : object
        ): object[]
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualObjectPropertyValues(
                objectPropertyExpression,
                individual);

        return this._decorated.ObjectPropertyValues(
            objectPropertyExpression,
            individual);
    }

    DataPropertyValues(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): any[]
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualDataPropertyValues(
                dataPropertyExpression,
                individual);

        return this._decorated.DataPropertyValues(
            dataPropertyExpression,
            individual);
    }

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): any
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualDataPropertyValue(
                dataPropertyExpression,
                individual);

        return this._decorated.DataPropertyValue(
            dataPropertyExpression,
            individual);
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
        ): any[]
    {
        let dataPropertyAssertions = this._dataPropertyAssertions.get(namedIndividual);
        return dataPropertyAssertions ?
            dataPropertyAssertions
                .filter(dataPropertyAssertion => dataPropertyAssertion.DataPropertyExpression === dataPropertyExpression)
                .map(dataPropertyAssertion => dataPropertyAssertion.TargetValue) : [];
    }

    private NamedIndividualDataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        namedIndividual: INamedIndividual
        ): any
    {
        let values = this.NamedIndividualDataPropertyValues(
            dataPropertyExpression,
            namedIndividual);

        return values.length ? values[0] : null;
    }
}
