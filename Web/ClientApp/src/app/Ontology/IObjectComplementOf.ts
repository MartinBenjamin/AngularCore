import { IClassExpression } from "./IClassExpression";

export interface IObjectComplementOf extends IClassExpression
{
    readonly ClassExpression: IClassExpression;
}
