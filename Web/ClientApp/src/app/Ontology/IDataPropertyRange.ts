import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IDataRange } from "./IDataRange";
import { IDataPropertyExpression } from "./IPropertyExpression";

export interface IDataPropertyRange extends IDataPropertyAxiom
{
    readonly DataPropertyExpression: IDataPropertyExpression;
    readonly Range                 : IDataRange;
}
