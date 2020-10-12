import { IClassAxiom } from "./IClassAxiom";
import { IClassExpression } from "./IClassExpression";

export interface IEquivalentClasses extends IClassAxiom
{
    readonly ClassExpressions: Iterable<IClassExpression>;
}
