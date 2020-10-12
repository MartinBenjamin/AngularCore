import { IClassExpression } from "./IClassExpression";
import { IPropertyExpression } from "./IPropertyExpression";

export interface IPropertyRestriction extends IClassExpression
{
    readonly PropertyExpression: IPropertyExpression;
}
