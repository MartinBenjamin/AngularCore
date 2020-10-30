import { DataPropertyDomain } from "./DataPropertyDomain";
import { Entity } from "./Entity";
import { HasKey } from "./HasKey";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IHasKey } from "./IHasKey";
import { INamedIndividual } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";
import { ClassAssertion, NamedIndividual } from "./NamedIndividual";
import { ObjectPropertyDomain } from "./ObjectPropertyDomain";
import { SubClassOf } from "./SubClassOf";

export class Class
    extends Entity
    implements IClass
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

    Accept(
        visitor: IClassExpressionVisitor
        ): void
    {
        visitor.Class(this);
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.Class(
            this,
            individual);
    }
    

    DeclareObjectProperty(
        localName: string
        ): IObjectPropertyExpression
    {
        return new ObjectPropertyDomain(
            this.Ontology,
            this.Ontology.DeclareObjectProperty(localName),
            this).ObjectPropertyExpression;
    }

    DeclareDataProperty(
        localName: string
        ): IDataPropertyExpression
    {
        return new DataPropertyDomain(
            this.Ontology,
            this.Ontology.DeclareDataProperty(localName),
            this).DataPropertyExpression;
    }

    DeclareFunctionalDataProperty(
        localName: string
        ): IDataPropertyExpression
    {
        return new DataPropertyDomain(
            this.Ontology,
            this.Ontology.DeclareFunctionalDataProperty(localName),
            this).DataPropertyExpression;
    }

    HasKey(
        dataPropertyExpressions: IDataPropertyExpression[]
        ): IHasKey
    {
        return new HasKey(
            this.Ontology,
            this,
            dataPropertyExpressions);
    }

    SubClassOf(
        superClassExpression: IClassExpression
        ): ISubClassOf
    {
        return new SubClassOf(
            this.Ontology,
            this,
            superClassExpression);
    }

    NamedIndividual(
        localName: string
        ): INamedIndividual
    {
        let namedIndividual = new NamedIndividual(
            this.Ontology,
            localName);
        new ClassAssertion(
            this.Ontology,
            this,
            namedIndividual);
        return namedIndividual;
    }
}
