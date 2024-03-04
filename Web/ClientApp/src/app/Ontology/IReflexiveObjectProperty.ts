import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface IReflexiveObjectProperty extends IObjectPropertyAxiom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
}
