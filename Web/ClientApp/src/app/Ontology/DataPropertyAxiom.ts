import { Axiom } from "./Axiom";
import { IDataPropertyAxiom } from "./IDataPropertyAxiom";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataPropertyAxiom
    extends Axiom
    implements IDataPropertyAxiom
{
    constructor(
        ontology                     : IOntology,
        public DataPropertyExpression: IDataPropertyExpression
        )
    {
        super(ontology);
    }
}
