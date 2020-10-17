import { Axiom } from "./Axiom";
import { IClassExpression } from "./IClassExpression";
import { IDisjointClasses } from "./IDisjointClasses";
import { IOntology } from "./IOntology";

export class DisjointClasses
    extends Axiom
    implements IDisjointClasses
{
    constructor(
        ontology               : IOntology,
        public ClassExpressions: IClassExpression[]
        )
    {
        super(ontology);
    }
}
