import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyRestriction } from "./IObjectPropertyRestriction";

export interface IObjectSomeValuesFrom extends IObjectPropertyRestriction
{
    readonly ClassExpression: IClassExpression;
}
