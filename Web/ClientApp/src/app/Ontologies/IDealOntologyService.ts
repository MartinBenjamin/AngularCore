import { IDealOntology } from "./IDealOntology";

export interface IDealOntologyService
{
    Get(iri: string): IDealOntology 
}
