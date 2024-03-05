import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface IFunctionalDataProperty extends IDataPropertyAxiom
{
    readonly DataPropertyExpression: IDataPropertyExpression;
}
