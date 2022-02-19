import { IClassExpression } from "./IClassExpression";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDataRange } from "./IDataRange";
import { IEntity } from "./IEntity";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectHasValue } from "./IObjectHasValue";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export interface IPropertyExpression extends IEntity
{
    Select<TResult>(selector: IPropertyExpressionSelector<TResult>): TResult
}

export interface IObjectPropertyExpression extends IPropertyExpression
{
    // Provided to assist construction of ontologies.
    HasValue(individual: object): IObjectHasValue;
    MinCardinality(
        cardinality     : number,
        classExpression?: IClassExpression): IObjectMinCardinality;
    MaxCardinality(
        cardinality     : number,
        classExpression?: IClassExpression): IObjectMaxCardinality;
    ExactCardinality(
        cardinality     : number,
        classExpression?: IClassExpression): IObjectExactCardinality;
}

export interface IDataPropertyExpression extends IPropertyExpression
{
    // Provided to assist construction of ontologies.
    HasValue(value: any): IDataHasValue;
    MinCardinality(
        cardinality: number,
        dataRange? : IDataRange): IDataMinCardinality;
    MaxCardinality(
        cardinality: number,
        dataRange? : IDataRange): IDataMaxCardinality;
    ExactCardinality(
        cardinality: number,
        dataRange? : IDataRange): IDataExactCardinality;
    Range(dataRange: IDataRange): IDataPropertyRange;
}
