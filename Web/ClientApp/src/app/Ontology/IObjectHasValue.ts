import { IObjectPropertyRestriction } from "./IObjectPropertyRestriction";

export interface IObjectHasValue extends IObjectPropertyRestriction
{
    readonly Individual: object;
}
