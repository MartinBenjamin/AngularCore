import { DataRange } from "./DataRange";
import { IDataComplementOf } from "./IDataComplementOf";
import { IDataRange } from "./IDataRange";

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
        value: object
        ): boolean
    {
        return !this.DataRange.HasMember(value);
    }
}
