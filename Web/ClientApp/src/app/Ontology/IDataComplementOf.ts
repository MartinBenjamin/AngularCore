import { IDataRange } from "./IDataRange";

export interface IDataComplementOf extends IDataRange
{
    readonly DataRange: IDataRange;
}
