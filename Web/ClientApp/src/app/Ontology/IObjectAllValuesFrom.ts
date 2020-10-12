import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyRestriction } from "./IObjectPropertyRestriction";

export interface IObjectAllValuesFrom extends IObjectPropertyRestriction
{
    readonly ClassExpression: IClassExpression;
}
