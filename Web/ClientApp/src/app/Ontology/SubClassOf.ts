import { Axiom } from "./Axiom";
import { ISubClassOf } from "./ISubClassOf";
import { IClassExpression } from "./IClassExpression";
import { IOntology } from "./IOntology";

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
}
