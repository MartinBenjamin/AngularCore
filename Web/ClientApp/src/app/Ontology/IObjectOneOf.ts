import { IClassExpression } from "./IClassExpression";

export interface IObjectOneOf extends IClassExpression
{
    readonly Individuals: object[];
}
