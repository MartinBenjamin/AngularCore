import { IClassAxiom } from "./IClassAxiom";
import { IClassExpression } from "./IClassExpression";

export interface ISubClassOf extends IClassAxiom
{
    readonly SubClassExpression  : IClassExpression;
    readonly SuperClassExpression: IClassExpression;
}
