import { IClassAxiom } from "./IClassAxiom";
import { IClassExpression } from "./IClassExpression";

export interface IDisjointClasses extends IClassAxiom
{
    readonly ClassExpressions: IClassExpression[];
}
