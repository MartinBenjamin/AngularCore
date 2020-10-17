import { DataPropertyAxiom } from "./DataPropertyAxiom";
import { IClassExpression } from "./IClassExpression";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataPropertyDomain
    extends DataPropertyAxiom
    implements IDataPropertyDomain
{
    constructor(
        ontology              : IOntology,
        dataPropertyExpression: IDataPropertyExpression,
        public Domain         : IClassExpression
        )
    {
        super(
            ontology,
            dataPropertyExpression);
    }
}
