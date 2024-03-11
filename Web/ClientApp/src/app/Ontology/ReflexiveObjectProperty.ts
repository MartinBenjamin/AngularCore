import { IAxiomVisitor } from "./IAxiomVisitor";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { IReflexiveObjectProperty } from "./IReflexiveObjectProperty";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class ReflexiveObjectProperty
    extends ObjectPropertyAxiom
    implements IReflexiveObjectProperty
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
        visitor.ReflexiveObjectProperty(this);
    }
}
