import { Axiom } from "./Axiom";
import { IAxiomSelector } from "./IAxiomSelector";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IClassExpression } from "./IClassExpression";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IOntology } from "./IOntology";

export class EquivalentClasses
    extends Axiom
    implements IEquivalentClasses
{
    constructor(
        ontology               : IOntology,
        public ClassExpressions: IClassExpression[]
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.EquivalentClasses(this);
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        return selector.EquivalentClasses(this);
    }
}
