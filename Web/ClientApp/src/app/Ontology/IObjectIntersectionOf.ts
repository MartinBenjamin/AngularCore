import { IClassExpression } from "./IClassExpression";

export interface IObjectIntersectionOf extends IClassExpression
{
    readonly ClassExpressions: IClassExpression[];
}
