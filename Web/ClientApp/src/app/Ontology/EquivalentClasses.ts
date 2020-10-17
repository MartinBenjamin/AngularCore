import { Axiom } from "./Axiom";
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
}
