import { IAxiom } from "./IAxiom";

export interface IEntity extends IAxiom
{
    readonly Iri      : string;
    readonly LocalName: string;
}
