import { IDataPropertyRestriction } from "./IDataPropertyRestriction";

export interface IDataHasValue extends IDataPropertyRestriction
{
    readonly Value: any;
}
