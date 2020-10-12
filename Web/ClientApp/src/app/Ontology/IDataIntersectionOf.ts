import { IDataRange } from "./IDataRange";

export interface IDataIntersectionOf extends IDataRange
{
    readonly DataRanges: IDataRange[];
}
