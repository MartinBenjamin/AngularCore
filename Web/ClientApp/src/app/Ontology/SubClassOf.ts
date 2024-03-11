import { Axiom } from "./Axiom";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IClassExpression } from "./IClassExpression";
import { IOntology } from "./IOntology";
import { ISubClassOf } from "./ISubClassOf";

export class SubClassOf
    extends Axiom
    implements ISubClassOf
{
    constructor(
        ontology                   : IOntology,
        public SubClassExpression  : IClassExpression,
        public SuperClassExpression: IClassExpression
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.SubClassOf(this);
    }
}
