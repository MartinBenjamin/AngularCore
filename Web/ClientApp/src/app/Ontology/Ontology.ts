import { IOntology } from "./IOntology";
import { IAxiom } from "./IAxiom";
import { IIsAxiom } from "./IIsAxiom";
import { IsAxiom } from "./IsAxiom";

export class Ontology implements IOntology
{
    Imports : IOntology[];
    Axioms  : IAxiom[];
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
        return [this];
        throw new Error("Method not implemented.");
    }

    Get<TAxiom extends import("./IAxiom").IAxiom>(typeGuard: (axiom: object) => axiom is TAxiom): Iterable<TAxiom>
    {
        throw new Error("Method not implemented.");
    }
}
