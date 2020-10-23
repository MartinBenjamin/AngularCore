import { IAxiom } from "./IAxiom";
import { IOntology } from "./IOntology";
import { IsAxiom } from "./IsAxiom";

export class Ontology implements IOntology
{
    Imports : IOntology[];
    Axioms  = [];
    IsAxiom = new IsAxiom();

    constructor(
        public Iri: string,
        ...imports: IOntology[]
        )
    {
        this.Imports = imports;
    }

    GetOntologies(): Iterable<IOntology>
    {
        let ontologies: IOntology[] = [this];
        for(let imported of this.Imports)
            ontologies.push(...imported.GetOntologies());

        return new Set(ontologies);
    }

    Get<TAxiom extends IAxiom>(
        typeGuard: (axiom: object) => axiom is TAxiom
        ): Iterable<TAxiom>
    {
        let current = this;
        return {
            *[Symbol.iterator]()
            {
                for(let ontology of current.GetOntologies())
                    for(let axiom of ontology.Axioms)
                        if(typeGuard(axiom))
                            yield axiom;
            }
        };
    }
}
