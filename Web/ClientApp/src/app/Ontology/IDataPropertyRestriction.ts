import { IDataPropertyExpression } from "./IPropertyExpression";
import { IPropertyRestriction } from "./IPropertyRestriction";

export interface IDataPropertyRestriction extends IPropertyRestriction
{
    readonly DataPropertyExpression: IDataPropertyExpression;
}
