import { DataRange } from "./DataRange";
import { IDataOneOf } from "./IDataOneOf";

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
}
