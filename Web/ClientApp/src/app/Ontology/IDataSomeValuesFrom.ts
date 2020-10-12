import { IDataPropertyRestriction } from "./IDataPropertyRestriction";
import { IDataRange } from "./IDataRange";

export interface IDataSomeValuesFrom extends IDataPropertyRestriction
{
    readonly DataRange: IDataRange;
}
