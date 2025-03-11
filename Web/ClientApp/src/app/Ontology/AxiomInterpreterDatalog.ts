import { Rule } from "../EavStore/Datalog";
import { IEavStore } from "../EavStore/IEavStore";
import { AddIndividuals } from "./AddIndividuals";
import { ClassExpressionInterpreter } from "./ClassExpressionInterpreterDatalog";
import { IDLSafeRule } from "./DLSafeRule";
import { IAnnotationAssertion } from "./IAnnotationAssertion";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IClassAssertion, IDataPropertyAssertion, IObjectPropertyAssertion } from "./IAssertion";
import { IAxiom } from "./IAxiom";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IClass } from "./IClass";
import { IClassExpressionSelector } from "./IClassExpressionSelector";
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
import { IIndividual } from "./IIndividual";
import { IInverseObjectProperties } from "./IInverseObjectProperties";
import { INamedIndividual } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IOntology } from "./IOntology";
import { IDataProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { IReflexiveObjectProperty } from "./IReflexiveObjectProperty";
import { IsAxiom } from "./IsAxiom";
import { IsClassExpression } from "./IsClassExpression";
import { ISubClassOf } from "./ISubClassOf";
import { ISubDataPropertyOf } from "./ISubDataPropertyOf";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";
import { ISymmetricObjectProperty } from "./ISymmetricObjectProperty";
import { ITransitiveObjectProperty } from "./ITransitiveObjectProperty";
import { PropertyExpressionInterpreter } from "./PropertyExpressionInterpreterDatalog";

export class AxiomInterpreter implements IAxiomVisitor
{
    private _isAxiom                      = new IsAxiom();
    private _isClassExpression            = new IsClassExpression();
    private _individualInterpretation     = new Map<IIndividual, any>();
    private _classExpressionInterpreter   : IClassExpressionSelector<string>;
    private _propertyExpressionInterpreter: IPropertyExpressionSelector<string>;

    constructor(
        private readonly _ontology: IOntology,
        private readonly _store   : IEavStore,
        private readonly _rules   : Rule[]
        )
    {
        this._individualInterpretation = AddIndividuals(
            this._ontology,
            this._store);
        this._classExpressionInterpreter = new ClassExpressionInterpreter(
            this._individualInterpretation,
            this._rules);
        this._propertyExpressionInterpreter = new PropertyExpressionInterpreter(
            this._rules);
    }

    Axiom(
        axiom: IAxiom
        ): void
    {
    }

    Entity(
        entity: IEntity
        ): void
    {
    }

    HasKey(
        hasKey: IHasKey
        ): void
    {
    }

    SubClassOf(
        subClassOf: ISubClassOf
        ): void
    {
        if(this._isClassExpression.IClass(subClassOf.SuperClassExpression))
            this._rules.push([[subClassOf.SuperClassExpression.Select(this._classExpressionInterpreter), '?x'], [[subClassOf.SubClassExpression.Select(this._classExpressionInterpreter), '?x']]]);
    }

    EquivalentClasses(
        equivalentClasses: IEquivalentClasses
        ): void
    {
        for(const classExpression1 of equivalentClasses.ClassExpressions)
            for(const classExpression2 of equivalentClasses.ClassExpressions)
                if(classExpression1 !== classExpression2 && this._isClassExpression.IClass(classExpression1))
                    this._rules.push([[classExpression1.Select(this._classExpressionInterpreter), '?x'], [[classExpression2.Select(this._classExpressionInterpreter), '?x']]]);
    }

    DisjointClasses(
        disjointClasses: IDisjointClasses
        ): void
    {
    }

    ClassAssertion(
        classAssertion: IClassAssertion
        ): void
    {
        if(this._isClassExpression.IClass(classAssertion.ClassExpression))
            this._rules.push([[classAssertion.ClassExpression.Select(this._classExpressionInterpreter), this.InterpretIndividual(classAssertion.Individual)], []]);
    }

    ObjectPropertyAssertion(
        objectPropertyAssertion: IObjectPropertyAssertion
        ): void
    {
    //    if(this._isAxiom.IObjectProperty(objectPropertyAssertion.ObjectPropertyExpression))
    //        this._rules.push([[objectPropertyAssertion.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), this.InterpretIndividual(objectPropertyAssertion.SourceIndividual), this.InterpretIndividual(objectPropertyAssertion.TargetIndividual)], []]);
    }

    DataPropertyAssertion(
        dataPropertyAssertion: IDataPropertyAssertion
        ): void
    {
    //    if(this._isAxiom.IDataProperty(dataPropertyAssertion.DataPropertyExpression))
    //        this._rules.push([[dataPropertyAssertion.DataPropertyExpression.Select(this._propertyExpressionInterpreter), this.InterpretIndividual(dataPropertyAssertion.SourceIndividual), dataPropertyAssertion.TargetValue], []]);
    }

    SubObjectPropertyOf(
        subObjectPropertyOf: ISubObjectPropertyOf
        ): void
    {
        if(this._isAxiom.IObjectProperty(subObjectPropertyOf.SuperObjectPropertyExpression))
            this._rules.push([[subObjectPropertyOf.SuperObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y'], [[subObjectPropertyOf.SubObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y']]]);
    }

    EquivalentObjectProperties(
        equivalentObjectProperties: IEquivalentObjectProperties
        ): void
    {
        for(const objectPropertyExpression1 of equivalentObjectProperties.ObjectPropertyExpressions)
            for(const objectPropertyExpression2 of equivalentObjectProperties.ObjectPropertyExpressions)
                if(objectPropertyExpression1 !== objectPropertyExpression2 && this._isAxiom.IObjectProperty(objectPropertyExpression1))
                    this._rules.push([[objectPropertyExpression1.Select(this._propertyExpressionInterpreter), '?x', '?y'], [[objectPropertyExpression2.Select(this._propertyExpressionInterpreter), '?x', '?y']]]);
    }

    InverseObjectProperties(
        inverseObjectProperties: IInverseObjectProperties
        ): void
    {
        const objectPropertyExpression1 = inverseObjectProperties.ObjectPropertyExpression1;
        const objectPropertyExpression2 = inverseObjectProperties.ObjectPropertyExpression2;
        if(this._isAxiom.IObjectProperty(objectPropertyExpression1))
            this._rules.push([[objectPropertyExpression1.Select(this._propertyExpressionInterpreter), '?x', '?y'], [[objectPropertyExpression2.Select(this._propertyExpressionInterpreter), '?y', '?x']]]);
        if(this._isAxiom.IObjectProperty(objectPropertyExpression2))
            this._rules.push([[objectPropertyExpression2.Select(this._propertyExpressionInterpreter), '?x', '?y'], [[objectPropertyExpression1.Select(this._propertyExpressionInterpreter), '?y', '?x']]]);
    }

    ObjectPropertyDomain(
        objectPropertyDomain: IObjectPropertyDomain
        ): void
    {
        if(this._isClassExpression.IClass(objectPropertyDomain.Domain))
            this._rules.push([[objectPropertyDomain.Domain.Iri, '?x'], [[objectPropertyDomain.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x',]]]);
    }

    ObjectPropertyRange(
        objectPropertyRange: IObjectPropertyRange
        ): void
    {
        if(this._isClassExpression.IClass(objectPropertyRange.Range))
            this._rules.push([[objectPropertyRange.Range.Iri, '?y'], [[objectPropertyRange.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), , '?y']]]);
    }

    FunctionalObjectProperty(
        functionalObjectProperty: IFunctionalObjectProperty
        ): void
    {
    }

    ReflexiveObjectProperty(
        reflexiveObjectProperty: IReflexiveObjectProperty
        ): void
    {
    }

    SymmetricObjectProperty(
        symmetricObjectProperty: ISymmetricObjectProperty
        ): void
    {
        if(this._isAxiom.IObjectProperty(symmetricObjectProperty.ObjectPropertyExpression))
        {
            const predicateSymbol = symmetricObjectProperty.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)
            this._rules.push([[predicateSymbol, '?x', '?y'], [[predicateSymbol, '?y', '?x']]]);
        }
    }

    TransitiveObjectProperty(
        transitiveObjectProperty: ITransitiveObjectProperty
        ): void
    {
        if(this._isAxiom.IObjectProperty(transitiveObjectProperty.ObjectPropertyExpression))
        {
            const predicateSymbol = transitiveObjectProperty.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)
            this._rules.push([[predicateSymbol, '?x', '?z'], [[predicateSymbol, '?x', '?y'], [predicateSymbol, '?y', '?z']]]);
        }
    }

    SubDataPropertyOf(
        subDataPropertyOf: ISubDataPropertyOf
        ): void
    {
        if(this._isAxiom.IDataProperty(subDataPropertyOf.SuperDataPropertyExpression))
            this._rules.push([[subDataPropertyOf.SuperDataPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y'], [[subDataPropertyOf.SubDataPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y']]]);
    }

    EquivalentDataProperties(
        equivalentDataProperties: IEquivalentDataProperties
        ): void
    {
        for(const dataPropertyExpression1 of equivalentDataProperties.DataPropertyExpressions)
            for(const dataPropertyExpression2 of equivalentDataProperties.DataPropertyExpressions)
                if(dataPropertyExpression1 !== dataPropertyExpression2 && this._isAxiom.IDataProperty(dataPropertyExpression1))
                    this._rules.push([[dataPropertyExpression1.Select(this._propertyExpressionInterpreter), '?x', '?y'], [[dataPropertyExpression2.Select(this._propertyExpressionInterpreter), '?x', '?y']]]);
    }

    DataPropertyDomain(
        dataPropertyDomain: IDataPropertyDomain
        ): void
    {
        if(this._isClassExpression.IClass(dataPropertyDomain.Domain))
            this._rules.push([[dataPropertyDomain.Domain.Iri, '?x'], [[dataPropertyDomain.DataPropertyExpression.Select(this._propertyExpressionInterpreter), '?x',]]]);
    }

    DataPropertyRange(
        dataPropertyRange: IDataPropertyRange
        ): void
    {
    }

    FunctionalDataProperty(
        functionalDataProperty: IFunctionalDataProperty
        ): void
    {
    }

    AnnotationAssertion(
        annotationAssertion: IAnnotationAssertion
        ): void
    {
    }

    DLSafeRule(
        dlSafeRule: IDLSafeRule
        ): void
    {
    }

    Class(
        class$: IClass
        ): void
    {
        this._rules.push([[class$.Select(this._classExpressionInterpreter), '?x'], [['?x', 'rdf:type', class$.Iri]]]);
    }

    Datatype(
        datatype: IDatatype
        ): void
    {
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): void
    {
        this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): void
    {
        this.Property(dataProperty);
    }

    AnnotationProperty(
        annotationProperty: IAnnotationProperty
        ): void
    {
    }

    NamedIndividual(
        namedIndividual: INamedIndividual
        ): void
    {
    }

    InterpretIndividual(
        individual: IIndividual
        ): any
    {
        return this._individualInterpretation.get(individual);
    }

    private Property(
        property: IProperty
        ): void
    {
        this._rules.push([[property.Select(this._propertyExpressionInterpreter), '?x', '?y'], [['?x', property.LocalName, '?y']]]);
    }
}
