import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyRestriction } from "./IObjectPropertyRestriction";

export interface IObjectCardinality extends IObjectPropertyRestriction
{

    readonly Cardinality    : number;
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
