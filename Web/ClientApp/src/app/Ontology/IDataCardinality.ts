import { ICardinality } from "./ICardinality";
import { IDataPropertyRestriction } from "./IDataPropertyRestriction";
import { IDataRange } from "./IDataRange";

export interface IDataCardinality extends ICardinality, IDataPropertyRestriction
{
    readonly DataRange: IDataRange;
}

export interface IDataMinCardinality extends IDataCardinality
{
}

export interface IDataMaxCardinality extends IDataCardinality
{
}

export interface IDataExactCardinality extends IDataCardinality
{
}
