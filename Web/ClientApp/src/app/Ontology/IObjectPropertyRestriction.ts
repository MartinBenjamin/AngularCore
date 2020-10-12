import { IObjectPropertyExpression } from "./IPropertyExpression";
import { IPropertyRestriction } from "./IPropertyRestriction";

export interface IObjectPropertyRestriction extends IPropertyRestriction
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
}
