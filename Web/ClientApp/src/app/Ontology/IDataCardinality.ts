import { IDataPropertyRestriction } from "./IDataPropertyRestriction";
import { IDataRange } from "./IDataRange";

export interface IDataCardinality extends IDataPropertyRestriction
{

    readonly Cardinality: number;
    readonly DataRange  : IDataRange;
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
