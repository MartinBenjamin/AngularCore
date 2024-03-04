import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class ObjectPropertyDomain
    extends ObjectPropertyAxiom
    implements IObjectPropertyDomain
{
    constructor(
        ontology                       : IOntology,
        public ObjectPropertyExpression: IObjectPropertyExpression,
        public Domain                  : IClassExpression
        )
    {
        super(ontology);
    }
}
