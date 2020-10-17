import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IDataRange } from "./IDataRange";

export interface IDataPropertyRange extends IDataPropertyAxiom
{
    Range: IDataRange;
}
