import { Axiom } from "./Axiom";
import { Entity } from "./Entity";
import { IClassAssertion, IDataPropertyAssertion, IObjectPropertyAssertion, IPropertyAssertion } from "./IAssertion";
import { IClassExpression } from "./IClassExpression";
import { IIndividual } from "./IIndividual";
import { INamedIndividual } from "./INamedIndividual";
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

    ObjectPropertyValue(
        objectPropertyExpression: IObjectPropertyExpression,
        targetIndividual        : IIndividual
        ): IObjectPropertyAssertion
    {
        return new ObjectPropertyAssertion(
            this.Ontology,
            objectPropertyExpression,
            this,
            targetIndividual);
    }

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        targetValue           : any
        ): IDataPropertyAssertion
    {
        return new DataPropertyAssertion(
            this.Ontology,
            dataPropertyExpression,
            this,
            targetValue);
    }
}

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
}
