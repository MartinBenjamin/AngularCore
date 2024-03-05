import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface ISubDataPropertyOf extends IDataPropertyAxiom
{
    readonly SubDataPropertyExpression  : IDataPropertyExpression;
    readonly SuperDataPropertyExpression: IDataPropertyExpression;
}
