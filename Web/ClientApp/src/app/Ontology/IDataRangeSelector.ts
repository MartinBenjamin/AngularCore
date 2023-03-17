import { IDataComplementOf } from "./IDataComplementOf";
import { IDataIntersectionOf } from "./IDataIntersectionOf";
import { IDataOneOf } from "./IDataOneOf";
import { IDatatypeSelector } from "./IDatatype";
import { IDatatypeRestriction } from "./IDatatypeRestriction";
import { IDataUnionOf } from "./IDataUnionOf";

export interface IDataRangeSelector<TResult> extends IDatatypeSelector<TResult>
{
    DataIntersectionOf (dataIntersectionOf : IDataIntersectionOf ): TResult;
    DataUnionOf        (dataUnionOf        : IDataUnionOf        ): TResult;
    DataComplementOf   (dataComplementOf   : IDataComplementOf   ): TResult;
    DataOneOf          (dataOneOf          : IDataOneOf          ): TResult;
    DatatypeRestriction(datatypeRestriction: IDatatypeRestriction): TResult;
}
