import { DataRange } from "./DataRange";
import { IDataIntersectionOf } from "./IDataIntersectionOf";
import { IDataRange } from "./IDataRange";

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
        value: object
        ): boolean
    {
        return this.DataRanges.every(dataRange => dataRange.HasMember(value));
    }
}
