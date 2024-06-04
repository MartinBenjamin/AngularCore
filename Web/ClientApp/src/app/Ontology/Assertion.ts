import { Axiom } from "./Axiom";
import { IClassAssertion, IDataPropertyAssertion, IObjectPropertyAssertion, IPropertyAssertion } from "./IAssertion";
import { IAxiomSelector } from "./IAxiomSelector";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IClassExpression } from "./IClassExpression";
import { IIndividual } from "./IIndividual";
import { INamedIndividual } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export class ClassAssertion
    extends Axiom
    implements IClassAssertion
{
    public constructor(
        ontology              : IOntology,
        public ClassExpression: IClassExpression,
        public Individual     : IIndividual
        )
    {
        super(ontology);
    }

    Accept(
        visitor: IAxiomVisitor
        ): void
    {
        visitor.ClassAssertion(this);
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        return selector.ClassAssertion(this);
    }
}

export class PropertyAssertion
    extends Axiom
    implements IPropertyAssertion
{
    protected constructor(
        ontology                 : IOntology,
        public PropertyExpression: IPropertyExpression,
        public SourceIndividual  : IIndividual
        )
    {
        super(ontology);
    }
}

export class ObjectPropertyAssertion
    extends PropertyAssertion
    implements IObjectPropertyAssertion
{
    constructor(
        ontology                       : IOntology,
        public ObjectPropertyExpression: IObjectPropertyExpression,
        public SourceIndividual        : IIndividual,
        public TargetIndividual        : IIndividual
        )
    {
        super(
            ontology,
            ObjectPropertyExpression,
            SourceIndividual);
    }

    Accept(
        visitor: IAxiomVisitor
        ): void
    {
        visitor.ObjectPropertyAssertion(this);
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        return selector.ObjectPropertyAssertion(this);
    }
}

export class DataPropertyAssertion
    extends PropertyAssertion
    implements IDataPropertyAssertion
{
    constructor(
        ontology                     : IOntology,
        public DataPropertyExpression: IDataPropertyExpression,
        public SourceIndividual      : INamedIndividual,
        public TargetValue           : any
        )
    {
        super(
            ontology,
            DataPropertyExpression,
            SourceIndividual);
    }

    Accept(
        visitor: IAxiomVisitor
        ): void
    {
        visitor.DataPropertyAssertion(this);
    }

    Select<TResult>(
        selector: IAxiomSelector<TResult>
        ): TResult
    {
        return selector.DataPropertyAssertion(this);
    }
}
