import { DataRange } from "./DataRange";
import { IDataOneOf } from "./IDataOneOf";

export class DataOneOf
    extends DataRange
    implements IDataOneOf
{
    constructor(
        public Values: object[]
        )
    {
        super();
    }


    HasMember(
        value: object
        ): boolean
    {
        return this.Values.contains(value);
    }
}
