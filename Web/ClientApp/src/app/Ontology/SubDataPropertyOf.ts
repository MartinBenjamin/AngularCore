import { DataPropertyAxiom } from "./DataPropertyAxiom";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";
import { ISubDataPropertyOf } from "./ISubDataPropertyOf";

export class SubDataPropertyOf
    extends DataPropertyAxiom
    implements ISubDataPropertyOf
{
    constructor(
        ontology                          : IOntology,
        public SubDataPropertyExpression  : IDataPropertyExpression,
        public SuperDataPropertyExpression: IDataPropertyExpression
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.SubDataPropertyOf(this);
    }
}
