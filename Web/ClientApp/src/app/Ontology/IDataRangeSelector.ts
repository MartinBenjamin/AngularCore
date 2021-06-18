import { IDataComplementOf } from "./IDataComplementOf";
import { IDataIntersectionOf } from "./IDataIntersectionOf";
import { IDataOneOf } from "./IDataOneOf";
import { IDatatype } from "./IDatatype";
import { IDataUnionOf } from "./IDataUnionOf";

export interface IDataRangeSelector<TResult>
{
    Datatype           (datatype           : IDatatype           ): TResult
    DataIntersectionOf (dataIntersectionOf : IDataIntersectionOf ): TResult
    DataUnionOf        (dataUnionOf        : IDataUnionOf        ): TResult
    DataComplementOf   (dataComplementOf   : IDataComplementOf   ): TResult
    DataOneOf          (dataOneOf          : IDataOneOf          ): TResult
    //DatatypeRestriction(datatypeRestriction: IDatatypeRestriction): TResult
}
