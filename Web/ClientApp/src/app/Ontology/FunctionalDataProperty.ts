import { DataPropertyAxiom } from "./DataPropertyAxiom";
import { IAxiomSelector } from "./IAxiomSelector";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class FunctionalDataProperty
    extends DataPropertyAxiom
    implements IFunctionalDataProperty
{
    constructor(
        ontology                     : IOntology,
        public DataPropertyExpression: IDataPropertyExpression
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        )
    {
        visitor.FunctionalDataProperty(this);
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        return selector.FunctionalDataProperty(this);
    }
}
