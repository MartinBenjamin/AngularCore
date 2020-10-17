import { IAxiom } from "./IAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface IObjectPropertyAxiom extends IAxiom
{
    ObjectPropertyExpression: IObjectPropertyExpression;
}
