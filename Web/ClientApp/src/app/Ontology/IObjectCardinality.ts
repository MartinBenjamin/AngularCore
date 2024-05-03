import { ICardinality } from "./ICardinality";
import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyRestriction } from "./IObjectPropertyRestriction";

export interface IObjectCardinality extends ICardinality, IObjectPropertyRestriction
{
    readonly ClassExpression: IClassExpression;
}

export interface IObjectMinCardinality extends IObjectCardinality
{
}

export interface IObjectMaxCardinality extends IObjectCardinality
{
}

export interface IObjectExactCardinality extends IObjectCardinality
{
}
