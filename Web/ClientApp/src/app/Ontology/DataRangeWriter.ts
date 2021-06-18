import { IDataComplementOf } from "./IDataComplementOf";
import { IDataIntersectionOf } from "./IDataIntersectionOf";
import { IDataOneOf } from "./IDataOneOf";
import { IDataRangeSelector } from "./IDataRangeSelector";
import { IDataUnionOf } from "./IDataUnionOf";

export class DataRangeWriter implements IDataRangeSelector<string>
{
    DataIntersectionOf(
        dataIntersectionOf: IDataIntersectionOf
        ): string
    {
        throw new Error("Method not implemented.");
    }

    DataUnionOf(
        dataUnionOf: IDataUnionOf
        ): string
    {
        throw new Error("Method not implemented.");
    }

    DataComplementOf(
        dataComplementOf: IDataComplementOf
        ): string
    {
        throw new Error("Method not implemented.");
    }

    DataOneOf(
        dataOneOf: IDataOneOf
        ): string
    {
        throw new Error("Method not implemented.");
    }

}
