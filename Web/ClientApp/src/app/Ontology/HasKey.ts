import { Axiom } from "./Axiom";
import { IClassExpression } from "./IClassExpression";
import { IHasKey } from "./IHasKey";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class HasKey
    extends Axiom
    implements IHasKey
{
    constructor(
        ontology                      : IOntology,
        public ClassExpression        : IClassExpression,
        public DataPropertyExpressions: IDataPropertyExpression[]
        )
    {
        super(ontology);
    }

    AreEqual(
        context: IOntology,
        lhs    : object,
        rhs    : object
        ): boolean
    {
        return this.DataPropertyExpressions.every(dataPropertyExpression => dataPropertyExpression.AreEqual(
            context,
            lhs,
            rhs));
    }
}
