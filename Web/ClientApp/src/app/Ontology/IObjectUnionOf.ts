import { IClassExpression } from "./IClassExpression";

export interface IObjectUnionOf extends IClassExpression
{
    readonly ClassExpressions: IClassExpression[];
}
