import { Annotated } from "./Annotated";
import { IAxiom } from "./IAxiom";
import { IAxiomSelector } from "./IAxiomSelector";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IOntology } from "./IOntology";

export abstract class Axiom
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

    Accept(
        visitor: IAxiomVisitor
        ): void
    {
        throw new Error("Method not implemented.");
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        throw new Error("Method not implemented.");
    }
}
