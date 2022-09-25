import { ClassAssertion } from "./Assertion";
import { Entity } from "./Entity";
import { EquivalentClasses } from "./EquivalentClasses";
import { HasKey } from "./HasKey";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IHasKey } from "./IHasKey";
import { INamedIndividual } from "./INamedIndividual";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";
import { ObjectComplementOf } from "./ObjectComplementOf";
import { ObjectIntersectionOf } from "./ObjectIntersectionOf";
import { ObjectUnionOf } from "./ObjectUnionOf";
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

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.Class(this);
    }

    DeclareNamedIndividual(
        localName: string
        ): INamedIndividual
    {
        const namedIndividual = this.Ontology.DeclareNamedIndividual(localName);
        new ClassAssertion(
            this.Ontology,
            this,
            namedIndividual);
        return namedIndividual;
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

    Define(
        definition: IClassExpression
        ): IEquivalentClasses
    {
        return new EquivalentClasses(
            this.Ontology,
            [this, definition]);
    }

    Intersect(
        classExpression: IClassExpression
        ): IObjectIntersectionOf
    {
        return new ObjectIntersectionOf([this, classExpression]);
    }

    Union(
        classExpression: IClassExpression
        ): IObjectUnionOf
    {
        return new ObjectUnionOf([this, classExpression]);
    }

    Complement(): IObjectComplementOf
    {
        return new ObjectComplementOf(this);
    }
}
