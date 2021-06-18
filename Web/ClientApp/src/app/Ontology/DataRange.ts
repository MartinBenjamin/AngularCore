import { IDataRange } from "./IDataRange";
import { IDataRangeSelector } from "./IDataRangeSelector";

export class DataRange implements IDataRange
{
    protected constructor()
    {
    }

    HasMember(
        value: any
        ): boolean
    {
        throw new Error("Method not implemented.");
    }

    Select<TResult>(
        selector: IDataRangeSelector<TResult>
        ): TResult
    {
        throw new Error("Method not implemented.");
    }
}
