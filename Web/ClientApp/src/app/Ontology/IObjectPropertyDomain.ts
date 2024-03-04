import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface IObjectPropertyDomain extends IObjectPropertyAxiom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
    readonly Domain                  : IClassExpression;
}
