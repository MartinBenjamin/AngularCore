import { AxiomWriter } from "./AxiomWriter";
import { IOntology } from "./IOntology";

export function OntologyWriter(): (ontology: IOntology) => string
{
    const axiomWriter = new AxiomWriter();
    return (ontology: IOntology): string =>
    {
        return `Ontology(${ontology.Iri
+ ontology.Imports.map(ontology => '\n' + ontology.Iri).join('')
+ ontology.Axioms.map(axiom => '\n' + axiom.Select(axiomWriter)).join('')}
)`
    };
}
