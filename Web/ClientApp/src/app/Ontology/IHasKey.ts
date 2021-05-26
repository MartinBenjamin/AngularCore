import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface IHasKey extends IAxiom
{
    readonly ClassExpression        : IClassExpression;
    readonly DataPropertyExpressions: IDataPropertyExpression[];
}
