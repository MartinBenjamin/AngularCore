import { IDataComplementOf } from "./IDataComplementOf";
import { IDataIntersectionOf } from "./IDataIntersectionOf";
import { IDataOneOf } from "./IDataOneOf";
import { IDataRangeSelector } from "./IDataRangeSelector";
import { IDatatype } from "./IDatatype";
import { IDatatypeRestriction } from "./IDatatypeRestriction";
import { IDataUnionOf } from "./IDataUnionOf";

export class DataRangeWriter implements IDataRangeSelector<string>
{
    Datatype(
        datatype: IDatatype
        ): string
    {
        return datatype.Iri;
    }

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
        return `DataUnionOf(${dataUnionOf.DataRanges.map(dataRange => dataRange.Select(this)).join(' ')})`;
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

    DatatypeRestriction(
        datatypeRestriction: IDatatypeRestriction
        ): string
    {
        throw new Error("Method not implemented.");
    }
}
