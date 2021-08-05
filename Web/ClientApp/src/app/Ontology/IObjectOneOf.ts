import { IClassExpression } from "./IClassExpression";
import { IIndividual } from "./IIndividual";

export interface IObjectOneOf extends IClassExpression
{
    readonly Individuals: IIndividual[];
}
