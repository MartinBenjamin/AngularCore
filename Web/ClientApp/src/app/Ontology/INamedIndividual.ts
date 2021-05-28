import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IEntity } from "./IEntity";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export interface INamedIndividual extends IEntity
{
    // Provided to assist construction of ontologies.
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
    readonly ClassExpression: IClassExpression;
    readonly NamedIndividual: INamedIndividual;
}

export interface IPropertyAssertion extends IAssertion
{
    readonly PropertyExpression: IPropertyExpression;
    readonly SourceIndividual  : INamedIndividual;
}

export interface IObjectPropertyAssertion extends IPropertyAssertion
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
    readonly TargetIndividual        : object;
}

export interface IDataPropertyAssertion extends IPropertyAssertion
{
    readonly DataPropertyExpression: IDataPropertyExpression;
    readonly TargetValue           : any;
}
