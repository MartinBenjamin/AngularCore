import { DataPropertyAxiom } from "./DataPropertyAxiom";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class FunctionalDataProperty
    extends DataPropertyAxiom
    implements IFunctionalDataProperty
{
    constructor(
        ontology                     : IOntology,
        public DataPropertyExpression: IDataPropertyExpression
        )
    {
        super(ontology);
    }
}
