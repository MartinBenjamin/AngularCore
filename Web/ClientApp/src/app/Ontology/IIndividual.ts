import { IDataPropertyAssertion, IObjectPropertyAssertion } from "./INamedIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";

export interface IIndividual
{
    // Provided to assist construction of ontologies.
    ObjectPropertyValue(
        objectPropertyExpression: IObjectPropertyExpression,
        targetIndividual        : IIndividual): IObjectPropertyAssertion;

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        targetValue           : any): IDataPropertyAssertion;
}
