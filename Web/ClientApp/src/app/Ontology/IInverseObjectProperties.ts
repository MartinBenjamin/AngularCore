import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface IInverseObjectProperties extends IObjectPropertyAxiom
{
    readonly ObjectPropertyExpression1: IObjectPropertyExpression;
    readonly ObjectPropertyExpression2: IObjectPropertyExpression;
}
