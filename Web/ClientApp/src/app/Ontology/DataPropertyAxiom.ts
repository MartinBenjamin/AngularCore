import { Axiom } from "./Axiom";
import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IOntology } from "./IOntology";

export class DataPropertyAxiom
    extends Axiom
    implements IDataPropertyAxiom
{
    constructor(
        ontology: IOntology
        )
    {
        super(ontology);
    }
}
