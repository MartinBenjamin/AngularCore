import { IClassExpressionSelector } from "./IClassExpressionSelector";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectUnionOf } from "./IObjectUnionOf";

export interface IClassExpression
{
    Accept(visitor: IClassExpressionVisitor): void;
    Select<TResult>(selector: IClassExpressionSelector<TResult>): TResult;

    // Provided to assist construction of ontologies.
    Intersect(classExpression: IClassExpression): IObjectIntersectionOf
    Union(classExpression: IClassExpression): IObjectUnionOf;
    Complement(): IObjectComplementOf;
}
