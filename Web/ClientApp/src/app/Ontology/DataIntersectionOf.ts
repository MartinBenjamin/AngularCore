import { DataRange } from "./DataRange";
import { IDataIntersectionOf } from "./IDataIntersectionOf";
import { IDataRange } from "./IDataRange";
import { IDataRangeSelector } from "./IDataRangeSelector";

export class DataIntersectionOf
    extends DataRange
    implements IDataIntersectionOf
{
    constructor(
        public DataRanges: IDataRange[]
        )
    {
        super();
    }

    HasMember(
        value: any
        ): boolean
    {
        return this.DataRanges.every(dataRange => dataRange.HasMember(value));
    }

    Select<TResult>(
        selector: IDataRangeSelector<TResult>
        ): TResult
    {
        return selector.DataIntersectionOf(this);
    }
}
