import { DataRange } from "./DataRange";
import { IDataComplementOf } from "./IDataComplementOf";
import { IDataRange } from "./IDataRange";
import { IDataRangeSelector } from "./IDataRangeSelector";

export class DataComplementOf
    extends DataRange
    implements IDataComplementOf
{
    constructor(
        public DataRange: IDataRange
        )
    {
        super();
    }

    HasMember(
        value: any
        ): boolean
    {
        return !this.DataRange.HasMember(value);
    }

    Select<TResult>(
        selector: IDataRangeSelector<TResult>
        ): TResult
    {
        return selector.DataComplementOf(this);
    }
}
