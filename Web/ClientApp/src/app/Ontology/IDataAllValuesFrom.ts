import { IDataPropertyRestriction } from "./IDataPropertyRestriction";
import { IDataRange } from "./IDataRange";

export interface IDataAllValuesFrom extends IDataPropertyRestriction
{
    readonly DataRange: IDataRange;
}
