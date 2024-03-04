import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface IEquivalentObjectProperties extends IObjectPropertyAxiom
{
    readonly ObjectPropertyExpressions: IObjectPropertyExpression[]
}
