import { Annotated } from "./Annotated";
import { IAxiom } from "./IAxiom";
import { IAxiomSelector } from "./IAxiomSelector";
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
        if(Ontology)
            Ontology.Axioms.push(this);
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        throw new Error("Method not implemented.");
    }
}
