import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface ISubObjectPropertyOf extends IObjectPropertyAxiom
{
    readonly SuperObjectPropertyExpression: IObjectPropertyExpression;
    readonly SubObjectPropertyExpression  : IObjectPropertyExpression;
}
