import { IAxiomSelector } from "./IAxiomSelector";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ISymmetricObjectProperty } from "./ISymmetricObjectProperty";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class SymmetricObjectProperty
    extends ObjectPropertyAxiom
    implements ISymmetricObjectProperty
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
        visitor.SymmetricObjectProperty(this);
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        return selector.SymmetricObjectProperty(this);
    }
}
