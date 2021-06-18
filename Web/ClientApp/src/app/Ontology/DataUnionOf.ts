import { DataRange } from "./DataRange";
import { IDataRange } from "./IDataRange";
import { IDataRangeSelector } from "./IDataRangeSelector";
import { IDataUnionOf } from "./IDataUnionOf";

export class DataUnionOf
    extends DataRange
    implements IDataUnionOf
{
    constructor(
        public DataRanges: IDataRange[]
        )
    {
        super();
    }

    HasMember(
        value: object
        ): boolean
    {
        return this.DataRanges.some(dataRange => dataRange.HasMember(value));
    }

    Select<TResult>(
        selector: IDataRangeSelector<TResult>
        ): TResult
    {
        return selector.DataUnionOf(this);
    }
}
