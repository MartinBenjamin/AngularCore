import { IClassExpression } from "./IClassExpression";
import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface IDataPropertyDomain extends IDataPropertyAxiom
{
    readonly DataPropertyExpression: IDataPropertyExpression;
    readonly Domain                : IClassExpression;
}
