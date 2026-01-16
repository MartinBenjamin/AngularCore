import { IClass } from "../Ontology/IClass";
import { IOntology } from "../Ontology/IOntology";

export interface IDealOntology extends IOntology
{
    readonly Deal: IClass
}
