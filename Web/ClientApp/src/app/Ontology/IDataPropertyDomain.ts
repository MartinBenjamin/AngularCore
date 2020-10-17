import { IClassExpression } from "./IClassExpression";
import { IDataPropertyAxiom } from "./IDataPropertyAxiom";

export interface IDataPropertyDomain extends IDataPropertyAxiom
{
    readonly Domain: IClassExpression;
}
