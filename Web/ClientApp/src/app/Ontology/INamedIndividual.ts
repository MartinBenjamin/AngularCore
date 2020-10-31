import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IEntity } from "./IEntity";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export interface INamedIndividual extends IEntity
{
    // Provided to assist programatic construction of ontologies.
    ObjectPropertyValue(
        objectPropertyExpression: IObjectPropertyExpression,
        targetIndividual        : object): IObjectPropertyAssertion;

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        targetValue           : any): IDataPropertyAssertion;
}

export interface IAssertion extends IAxiom
{
}

export interface IClassAssertion extends IAssertion
{
    ClassExpression: IClassExpression;
    NamedIndividual: INamedIndividual;
}

export interface IPropertyAssertion extends IAssertion
{
    PropertyExpression: IPropertyExpression;
    SourceIndividual  : INamedIndividual;
}

export interface IObjectPropertyAssertion extends IPropertyAssertion
{
    ObjectPropertyExpression: IObjectPropertyExpression;
    TargetIndividual        : object;
}

export interface IDataPropertyAssertion extends IPropertyAssertion
{
    DataPropertyExpression: IDataPropertyExpression;
    TargetValue           : any;
}
