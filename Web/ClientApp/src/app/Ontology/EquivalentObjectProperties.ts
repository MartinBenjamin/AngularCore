import { IEquivalentObjectProperties } from "./IEquivalentObjectProperties";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class EquivalentObjectProperties
    extends ObjectPropertyAxiom
    implements IEquivalentObjectProperties
{

    constructor(
        ontology                        : IOntology,
        public ObjectPropertyExpressions: IObjectPropertyExpression[]
        )
    {
        super(ontology);
    }
}
