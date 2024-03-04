import { Axiom } from "./Axiom";
import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IOntology } from "./IOntology";

export class ObjectPropertyAxiom
    extends Axiom
    implements IObjectPropertyAxiom
{
    constructor(
        ontology: IOntology
        )
    {
        super(ontology);
    }
}
