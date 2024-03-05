import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface IEquivalentDataProperties extends IDataPropertyAxiom
{
    readonly DataPropertyExpressions: IDataPropertyExpression[];
}
