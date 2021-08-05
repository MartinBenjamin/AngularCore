import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IIndividual } from "./IIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export interface IAssertion extends IAxiom
{
}

export interface IClassAssertion extends IAssertion
{
    readonly ClassExpression: IClassExpression;
    readonly Individual     : IIndividual;
}

export interface IPropertyAssertion extends IAssertion
{
    readonly PropertyExpression: IPropertyExpression;
    readonly SourceIndividual  : IIndividual;
}

export interface IObjectPropertyAssertion extends IPropertyAssertion
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
    readonly TargetIndividual        : IIndividual;
}

export interface IDataPropertyAssertion extends IPropertyAssertion
{
    readonly DataPropertyExpression: IDataPropertyExpression;
    readonly TargetValue           : any;
}
