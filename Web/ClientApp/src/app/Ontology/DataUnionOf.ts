import { DataRange } from "./DataRange";
import { IDataUnionOf } from "./IDataUnionOf";
import { IDataRange } from "./IDataRange";

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
}
