import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export interface IObjectPropertyRange extends IObjectPropertyAxiom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
    readonly Range                   : IClassExpression;
}
