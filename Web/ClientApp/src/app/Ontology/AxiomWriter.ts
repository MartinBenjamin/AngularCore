import { ClassExpressionWriter } from "./ClassExpressionWriter";
import { IDLSafeRule } from "./DLSafeRule";
import { IAnnotationAssertion } from "./IAnnotationAssertion";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IClassAssertion, IDataPropertyAssertion, IObjectPropertyAssertion } from "./IAssertion";
import { IAxiom } from "./IAxiom";
import { IAxiomSelector } from "./IAxiomSelector";
import { IClass } from "./IClass";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDatatype } from "./IDatatype";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEntity } from "./IEntity";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IEquivalentDataProperties } from "./IEquivalentDataProperties";
import { IEquivalentObjectProperties } from "./IEquivalentObjectProperties";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IFunctionalObjectProperty } from "./IFunctionalObjectProperty";
import { IHasKey } from "./IHasKey";
import { IInverseObjectProperties } from "./IInverseObjectProperties";
import { INamedIndividual } from "./INamedIndividual";
import { IndividualWriter } from "./IndividualWriter";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IDataProperty, IObjectProperty } from "./IProperty";
import { IReflexiveObjectProperty } from "./IReflexiveObjectProperty";
import { ISubClassOf } from "./ISubClassOf";
import { ISubDataPropertyOf } from "./ISubDataPropertyOf";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";
import { ISymmetricObjectProperty } from "./ISymmetricObjectProperty";
import { ITransitiveObjectProperty } from "./ITransitiveObjectProperty";

export class AxiomWriter implements IAxiomSelector<string>
{
    public readonly ClassExpressionWriter = new ClassExpressionWriter();
    public readonly IndividualWriter      = new IndividualWriter();

    constructor()
    {
    }

    Axiom(
        axiom: IAxiom
        ): string
    {
        throw new Error("Method not implemented.");
    }

    Entity(
        entity: IEntity
        ): string
    {
        return entity.Iri;
    }

    AnnotationProperty(
        annotationProperty: IAnnotationProperty
        ): string
    {
        throw new Error("Method not implemented.");
    }

    NamedIndividual(
        namedIndividual: INamedIndividual
        ): string
    {
        return `Declaration(NamedIndividual(${namedIndividual.Select(this.IndividualWriter)}))`;
    }

    HasKey(
        hasKey: IHasKey
        ): string
    {
        throw new Error("Method not implemented.");
    }

    SubClassOf(
        subClassOf: ISubClassOf
        ): string
    {
        return `SubClassOf(${subClassOf.SubClassExpression.Select(this.ClassExpressionWriter)} ${subClassOf.SuperClassExpression.Select(this.ClassExpressionWriter)})`;
    }

    EquivalentClasses(equivalentClasses: IEquivalentClasses): string {
        throw new Error("Method not implemented.");
    }
    DisjointClasses(disjointClasses: IDisjointClasses): string {
        throw new Error("Method not implemented.");
    }

    ClassAssertion(
        classAssertion: IClassAssertion
        ): string
    {
        return `ClassAssertion(${classAssertion.ClassExpression.Select(this.ClassExpressionWriter)} ${classAssertion.Individual.Select(this.IndividualWriter)})`;
    }

    ObjectPropertyAssertion(objectPropertyAssertion: IObjectPropertyAssertion): string {
        throw new Error("Method not implemented.");
    }
    DataPropertyAssertion(dataPropertyAssertion: IDataPropertyAssertion): string {
        throw new Error("Method not implemented.");
    }
    SubObjectPropertyOf(subObjectPropertyOf: ISubObjectPropertyOf): string {
        throw new Error("Method not implemented.");
    }
    EquivalentObjectProperties(equivalentObjectProperties: IEquivalentObjectProperties): string {
        throw new Error("Method not implemented.");
    }
    InverseObjectProperties(inverseObjectProperties: IInverseObjectProperties): string {
        throw new Error("Method not implemented.");
    }
    ObjectPropertyDomain(objectPropertyDomain: IObjectPropertyDomain): string {
        throw new Error("Method not implemented.");
    }
    ObjectPropertyRange(objectPropertyRange: IObjectPropertyRange): string {
        throw new Error("Method not implemented.");
    }
    FunctionalObjectProperty(functionalObjectProperty: IFunctionalObjectProperty): string {
        throw new Error("Method not implemented.");
    }
    ReflexiveObjectProperty(reflexiveObjectProperty: IReflexiveObjectProperty): string {
        throw new Error("Method not implemented.");
    }
    SymmetricObjectProperty(symmetricObjectProperty: ISymmetricObjectProperty): string {
        throw new Error("Method not implemented.");
    }
    TransitiveObjectProperty(transitiveObjectProperty: ITransitiveObjectProperty): string {
        throw new Error("Method not implemented.");
    }
    SubDataPropertyOf(subDataPropertyOf: ISubDataPropertyOf): string {
        throw new Error("Method not implemented.");
    }
    EquivalentDataProperties(equivalentDataProperties: IEquivalentDataProperties): string {
        throw new Error("Method not implemented.");
    }
    DataPropertyDomain(dataPropertyDomain: IDataPropertyDomain): string {
        throw new Error("Method not implemented.");
    }
    DataPropertyRange(dataPropertyRange: IDataPropertyRange): string {
        throw new Error("Method not implemented.");
    }
    FunctionalDataProperty(functionalDataProperty: IFunctionalDataProperty): string {
        throw new Error("Method not implemented.");
    }
    AnnotationAssertion(annotationAssertion: IAnnotationAssertion): string {
        throw new Error("Method not implemented.");
    }
    DLSafeRule(dlSafeRule: IDLSafeRule): string {
        throw new Error("Method not implemented.");
    }

    Class(
        class$: IClass
        ): string
    {
        return `Declaration(Class(${this.Entity(class$)}))`;
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): string
    {
        return `Declaration(ObjectProperty(${this.Entity(objectProperty)}))`;
    }

    DataProperty(
        dataProperty: IDataProperty
        ): string
    {
        return `Declaration(DataProperty(${this.Entity(dataProperty)}))`;
    }

    Datatype(
        datatype: IDatatype
        ): string
    {
        return `Declaration(Datatype(${this.Entity(datatype)}))`;
    }
}
