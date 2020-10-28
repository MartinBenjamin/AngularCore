import { IDataRange } from "./IDataRange";

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
}
