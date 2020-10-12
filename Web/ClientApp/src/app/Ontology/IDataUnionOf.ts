import { IDataRange } from "./IDataRange";

export interface IDataUnionOf extends IDataRange
{
    readonly DataRanges: IDataRange[];
}
