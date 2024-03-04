import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface ISymmetricObjectProperty extends IObjectPropertyAxiom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
}
