import { DataPropertyAxiom } from "./DataPropertyAxiom";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IEquivalentDataProperties } from "./IEquivalentDataProperties";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class EquivalentDataProperties
    extends DataPropertyAxiom
    implements IEquivalentDataProperties
{
    constructor(
        ontology                      : IOntology,
        public DataPropertyExpressions: IDataPropertyExpression[]
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.EquivalentDataProperties(this);
    }
}
