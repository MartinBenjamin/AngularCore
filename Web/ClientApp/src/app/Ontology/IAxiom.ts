import { IAnnotated } from "./IAnnotated";
import { IOntology } from "./IOntology";

export interface IAxiom extends IAnnotated
{
    readonly Ontology: IOntology;
}
