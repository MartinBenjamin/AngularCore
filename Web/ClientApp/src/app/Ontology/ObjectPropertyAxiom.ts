import { Axiom } from "./Axiom";
import { IObjectPropertyAxiom } from "./IObjectPropertyAxiom";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export class ObjectPropertyAxiom
    extends Axiom
    implements IObjectPropertyAxiom
{
    constructor(
        ontology                       : IOntology,
        public ObjectPropertyExpression: IObjectPropertyExpression
    )
    {
        super(ontology);
    }
}
