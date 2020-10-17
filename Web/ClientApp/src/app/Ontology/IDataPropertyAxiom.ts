import { IAxiom } from "./IAxiom";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface IDataPropertyAxiom extends IAxiom
{
    DataPropertyExpression: IDataPropertyExpression;
}
