import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { IOntology } from "../Ontology/IOntology";

export interface IDealOntology extends IOntology
{
    readonly Deal: IClass
}
