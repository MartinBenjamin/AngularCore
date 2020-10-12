import { IClassExpression } from "./IClassExpression";
import { IEntity } from "./IEntity";

export interface IClass extends
    IEntity,
    IClassExpression
{
}
