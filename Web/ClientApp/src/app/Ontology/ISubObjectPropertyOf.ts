import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface ISubObjectPropertyOf extends IObjectPropertyAxiom
{
    readonly SubObjectPropertyExpression  : IObjectPropertyExpression;
    readonly SuperObjectPropertyExpression: IObjectPropertyExpression;
}
