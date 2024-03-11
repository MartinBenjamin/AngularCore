import { IAxiomVisitor } from "./IAxiomVisitor";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class SubObjectPropertyOf
    extends ObjectPropertyAxiom
    implements ISubObjectPropertyOf
{
    constructor(
        ontology                            : IOntology,
        public SubObjectPropertyExpression  : IObjectPropertyExpression,
        public SuperObjectPropertyExpression: IObjectPropertyExpression
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.SubObjectPropertyOf(this);
    }
}
