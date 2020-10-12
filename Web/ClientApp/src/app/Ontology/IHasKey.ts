import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface IHasKey extends IAxiom
{

    readonly ClassExpression        : IClassExpression;
    readonly DataPropertyExpressions: IDataPropertyExpression[];

    AreEqual(
        context: IOntology,
        lhs    : object,
        rhs    : object): boolean;
}
