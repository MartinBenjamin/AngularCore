import { IDataRangeSelector } from "./IDataRangeSelector";

export interface IDataRange
{
    HasMember(value: any): boolean;
    Select<TResult>(selector: IDataRangeSelector<TResult>): TResult
}
