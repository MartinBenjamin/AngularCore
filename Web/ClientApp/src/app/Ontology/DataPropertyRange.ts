import { DataPropertyAxiom } from "./DataPropertyAxiom";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDataRange } from "./IDataRange";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataPropertyRange
    extends DataPropertyAxiom
    implements IDataPropertyRange
{
    constructor(
        ontology                     : IOntology,
        public DataPropertyExpression: IDataPropertyExpression,
        public Range                 : IDataRange
        )
    {
        super(ontology);
    }
}
