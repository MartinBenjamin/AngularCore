import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";

export interface IObjectPropertyRange extends IObjectPropertyAxiom
{
    Range: IClassExpression;
}
