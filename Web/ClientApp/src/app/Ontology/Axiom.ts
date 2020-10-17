import { Annotated } from "./Annotated";
import { IAxiom } from "./IAxiom";
import { IOntology } from "./IOntology";

export class Axiom
    extends Annotated
    implements IAxiom
{
    protected constructor(
        public Ontology: IOntology
        )
    {
        super();
    }
}
