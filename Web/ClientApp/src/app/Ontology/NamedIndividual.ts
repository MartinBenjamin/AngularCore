import { Axiom } from "./Axiom";
import { Entity } from "./Entity";
import { IClassExpression } from "./IClassExpression";
import { IClassAssertion, IDataPropertyAssertion, INamedIndividual, IObjectPropertyAssertion, IPropertyAssertion } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export class NamedIndividual
    extends Entity
    implements INamedIndividual
{
    constructor(
        ontology : IOntology,
        localName: string
        )
    {
        super(
            ontology,
            localName);
    }
}

export class ClassAssertion
    extends Axiom
    implements IClassAssertion
{
    public constructor(
        ontology              : IOntology,
        public ClassExpression: IClassExpression,
        public NamedIndividual: INamedIndividual
        )
    {
        super(ontology);
    }
}

export class PropertyAssertion
    extends Axiom
    implements IPropertyAssertion
{
    protected constructor(
        ontology                 : IOntology,
        public PropertyExpression: IPropertyExpression,
        public SourceIndividual  : INamedIndividual
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
        public SourceIndividual        : INamedIndividual,
        public TargetIndividual        : object
        )
    {
        super(
            ontology,
            ObjectPropertyExpression,
            SourceIndividual);
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
        public TargetValue           : object
        )
    {
        super(
            ontology,
            DataPropertyExpression,
            SourceIndividual);
    }
}
