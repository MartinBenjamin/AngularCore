import { IAxiom } from "./IAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface IObjectPropertyAxiom extends IAxiom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
}
