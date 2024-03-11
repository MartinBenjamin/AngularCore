import { IAxiomVisitor } from "./IAxiomVisitor";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ITransitiveObjectProperty } from "./ITransitiveObjectProperty";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class TransitiveObjectProperty
    extends ObjectPropertyAxiom
    implements ITransitiveObjectProperty
{
    constructor(
        ontology                       : IOntology,
        public ObjectPropertyExpression: IObjectPropertyExpression
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.TransitiveObjectProperty(this);
    }
}
