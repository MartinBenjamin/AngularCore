import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface ITransitiveObjectProperty extends IObjectPropertyAxiom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
}
