import { IAxiomVisitor } from "./IAxiomVisitor";
import { IInverseObjectProperties } from "./IInverseObjectProperties";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class InverseObjectProperties
    extends ObjectPropertyAxiom
    implements IInverseObjectProperties
{
    constructor(
        ontology                        : IOntology,
        public ObjectPropertyExpression1: IObjectPropertyExpression,
        public ObjectPropertyExpression2: IObjectPropertyExpression
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.InverseObjectProperties(this);
    }
}
