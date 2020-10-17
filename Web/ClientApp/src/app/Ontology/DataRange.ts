import { IDataRange } from "./IDataRange";

export class DataRange implements IDataRange
{
    protected constructor()
    {
    }

    HasMember(
        value: object
        ): boolean
    {
        throw new Error("Method not implemented.");
    }
}
