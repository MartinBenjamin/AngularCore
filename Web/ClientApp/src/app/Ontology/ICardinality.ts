import { IPropertyRestriction } from "./IPropertyRestriction";

export interface ICardinality extends IPropertyRestriction
{
    readonly Cardinality: number;
}
