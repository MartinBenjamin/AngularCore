import { DataRange } from "./DataRange";
import { IDataOneOf } from "./IDataOneOf";
import { IDataRangeSelector } from "./IDataRangeSelector";

export class DataOneOf
    extends DataRange
    implements IDataOneOf
{
    constructor(
        public Values: any[]
        )
    {
        super();
    }


    HasMember(
        value: any
        ): boolean
    {
        return this.Values.includes(value);
    }

    Select<TResult>(
        selector: IDataRangeSelector<TResult>
        ): TResult
    {
        return selector.DataOneOf(this);
    }
}
