import { DataPropertyDomain } from "./DataPropertyDomain";
import { Entity } from "./Entity";
import { HasKey } from "./HasKey";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IHasKey } from "./IHasKey";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";
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
        let objectProperty = this.Ontology.DeclareObjectProperty(localName);
        new ObjectPropertyDomain(
            this.Ontology,
            objectProperty,
            this);
        return objectProperty;
    }

    DeclareDataProperty(
        localName: string
        ): IDataPropertyExpression
    {
        let dataProperty = this.Ontology.DeclareDataProperty(localName);
        new DataPropertyDomain(
            this.Ontology,
            dataProperty,
            this);
        return dataProperty;
    }

    DeclareFunctionalDataProperty(
        localName: string
        ): IDataPropertyExpression
    {
        let functionalDataProperty = this.Ontology.DeclareFunctionalDataProperty(localName); new DataPropertyDomain(
            this.Ontology,
            functionalDataProperty,
            this);
        return functionalDataProperty;
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
}
