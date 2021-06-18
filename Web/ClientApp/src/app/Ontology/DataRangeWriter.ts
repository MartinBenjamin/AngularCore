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
        return `DataIntersectionOf(${dataIntersectionOf.DataRanges.map(dataRange => dataRange.Select(this)).join(' ')})`;
    }

    DataUnionOf(
        dataUnionOf: IDataUnionOf
        ): string
    {
        return `DataIntersectionOf(${dataUnionOf.DataRanges.map(dataRange => dataRange.Select(this)).join(' ')})`;
    }

    DataComplementOf(
        dataComplementOf: IDataComplementOf
        ): string
    {
        return `DataComplementOf(${dataComplementOf.DataRange.Select(this)})`;
    }

    DataOneOf(
        dataOneOf: IDataOneOf
        ): string
    {
        return `DataOneOf(${dataOneOf.Values.join(' ')})`;
    }
}
