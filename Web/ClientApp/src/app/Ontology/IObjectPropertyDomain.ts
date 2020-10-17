import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";

export interface IObjectPropertyDomain extends IObjectPropertyAxiom
{
    readonly Domain: IClassExpression;
}
