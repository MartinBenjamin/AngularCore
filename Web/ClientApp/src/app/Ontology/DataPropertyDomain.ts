import { DataPropertyAxiom } from "./DataPropertyAxiom";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IClassExpression } from "./IClassExpression";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataPropertyDomain
    extends DataPropertyAxiom
    implements IDataPropertyDomain
{
    constructor(
        ontology                     : IOntology,
        public DataPropertyExpression: IDataPropertyExpression,
        public Domain                : IClassExpression
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.DataPropertyDomain(this);
    }
}
