import { IDataPropertyAssertion, IObjectPropertyAssertion } from "./IAssertion";
import { IIndividualSelector } from "./IIndividualSelector";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";

export interface IIndividual
{
    Select<TResult>(selector: IIndividualSelector<TResult>): TResult;

    // Provided to assist construction of ontologies.
    ObjectPropertyValue(
        objectPropertyExpression: IObjectPropertyExpression,
        targetIndividual        : IIndividual): IObjectPropertyAssertion;

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        targetValue           : any): IDataPropertyAssertion;
}
