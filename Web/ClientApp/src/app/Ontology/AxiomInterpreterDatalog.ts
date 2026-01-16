import { BuiltIn } from '../EavStore/BuiltIn';
import { Idb, Rule } from "../EavStore/Datalog";
import { EntityId } from '../EavStore/EavStore';
import { IEavStore } from "../EavStore/IEavStore";
import { AddIndividuals } from "./AddIndividuals";
import { AtomInterpreter } from './AtomInterpreterDatalog';
import { ClassExpressionInterpreter } from "./ClassExpressionInterpreterDatalog";
import { IAtomSelector, IDLSafeRule, IsAtom } from "./DLSafeRule";
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

const isAtom = new IsAtom();

export class AxiomInterpreter implements IAxiomVisitor
{
    public  ClassExpressionInterpreter    : IClassExpressionSelector<string>;
    public  PropertyExpressionInterpreter : IPropertyExpressionSelector<string>;
    public  AtomInterpreter               : IAtomSelector<Idb | BuiltIn>;
    private _isAxiom                      = new IsAxiom();
    private _isClassExpression            = new IsClassExpression();
    private _individualInterpretation     = new Map<IIndividual, any>();

    constructor(
        private readonly _ontology: IOntology,
        private readonly _store   : IEavStore,
        private readonly _rules   : Rule[]
        )
    {
        this.PropertyExpressionInterpreter = new PropertyExpressionInterpreter(this._rules);
        this._individualInterpretation = AddIndividuals(
            this._ontology,
            this._store);
        this.ClassExpressionInterpreter = new ClassExpressionInterpreter(
            this.PropertyExpressionInterpreter,
            this._individualInterpretation,
            this._rules);
        this.AtomInterpreter = new AtomInterpreter(
            this.ClassExpressionInterpreter,
            this.PropertyExpressionInterpreter,
            this._individualInterpretation);
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
            this._rules.push([[subClassOf.SuperClassExpression.Select(this.ClassExpressionInterpreter), '?x'], [[subClassOf.SubClassExpression.Select(this.ClassExpressionInterpreter), '?x']]]);
    }

    EquivalentClasses(
        equivalentClasses: IEquivalentClasses
        ): void
    {
        for(const classExpression1 of equivalentClasses.ClassExpressions)
            for(const classExpression2 of equivalentClasses.ClassExpressions)
                if(classExpression1 !== classExpression2 && this._isClassExpression.IClass(classExpression1))
                    this._rules.push([[classExpression1.Select(this.ClassExpressionInterpreter), '?x'], [[classExpression2.Select(this.ClassExpressionInterpreter), '?x']]]);
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
    //    if(this._isClassExpression.IClass(classAssertion.ClassExpression))
    //        this._rules.push([[classAssertion.ClassExpression.Select(this.ClassExpressionInterpreter), this.Individual(classAssertion.Individual)], []]);
    }

    ObjectPropertyAssertion(
        objectPropertyAssertion: IObjectPropertyAssertion
        ): void
    {
    //    this._rules.push([[objectPropertyAssertion.ObjectPropertyExpression.Select(this.PropertyExpressionInterpreter), this.Individual(objectPropertyAssertion.SourceIndividual), this.Individual(objectPropertyAssertion.TargetIndividual)], []]);
    }

    DataPropertyAssertion(
        dataPropertyAssertion: IDataPropertyAssertion
        ): void
    {
    //    this._rules.push([[dataPropertyAssertion.DataPropertyExpression.Select(this.PropertyExpressionInterpreter), this.Individual(dataPropertyAssertion.SourceIndividual), dataPropertyAssertion.TargetValue], []]);
    }

    SubObjectPropertyOf(
        subObjectPropertyOf: ISubObjectPropertyOf
        ): void
    {
        this._rules.push([[subObjectPropertyOf.SuperObjectPropertyExpression.Select(this.PropertyExpressionInterpreter), '?x', '?y'], [[subObjectPropertyOf.SubObjectPropertyExpression.Select(this.PropertyExpressionInterpreter), '?x', '?y']]]);
    }

    EquivalentObjectProperties(
        equivalentObjectProperties: IEquivalentObjectProperties
        ): void
    {
        for(const objectPropertyExpression1 of equivalentObjectProperties.ObjectPropertyExpressions)
            for(const objectPropertyExpression2 of equivalentObjectProperties.ObjectPropertyExpressions)
                if(objectPropertyExpression1 !== objectPropertyExpression2)
                    this._rules.push([[objectPropertyExpression1.Select(this.PropertyExpressionInterpreter), '?x', '?y'], [[objectPropertyExpression2.Select(this.PropertyExpressionInterpreter), '?x', '?y']]]);
    }

    InverseObjectProperties(
        inverseObjectProperties: IInverseObjectProperties
        ): void
    {
        const objectPropertyExpression1 = inverseObjectProperties.ObjectPropertyExpression1;
        const objectPropertyExpression2 = inverseObjectProperties.ObjectPropertyExpression2;
        this._rules.push([[objectPropertyExpression1.Select(this.PropertyExpressionInterpreter), '?x', '?y'], [[objectPropertyExpression2.Select(this.PropertyExpressionInterpreter), '?y', '?x']]]);
        this._rules.push([[objectPropertyExpression2.Select(this.PropertyExpressionInterpreter), '?x', '?y'], [[objectPropertyExpression1.Select(this.PropertyExpressionInterpreter), '?y', '?x']]]);
    }

    ObjectPropertyDomain(
        objectPropertyDomain: IObjectPropertyDomain
        ): void
    {
        if(this._isClassExpression.IClass(objectPropertyDomain.Domain))
            this._rules.push([[objectPropertyDomain.Domain.Select(this.ClassExpressionInterpreter), '?x'], [[objectPropertyDomain.ObjectPropertyExpression.Select(this.PropertyExpressionInterpreter), '?x',]]]);
    }

    ObjectPropertyRange(
        objectPropertyRange: IObjectPropertyRange
        ): void
    {
        if(this._isClassExpression.IClass(objectPropertyRange.Range))
            this._rules.push([[objectPropertyRange.Range.Select(this.ClassExpressionInterpreter), '?y'], [[objectPropertyRange.ObjectPropertyExpression.Select(this.PropertyExpressionInterpreter), , '?y']]]);
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
        const predicateSymbol = reflexiveObjectProperty.ObjectPropertyExpression.Select(this.PropertyExpressionInterpreter)
        this._rules.push([[predicateSymbol, '?x', '?x'], [['?x', EntityId,]]]);
    }

    SymmetricObjectProperty(
        symmetricObjectProperty: ISymmetricObjectProperty
        ): void
    {
        const predicateSymbol = symmetricObjectProperty.ObjectPropertyExpression.Select(this.PropertyExpressionInterpreter)
        this._rules.push([[predicateSymbol, '?x', '?y'], [[predicateSymbol, '?y', '?x']]]);
    }

    TransitiveObjectProperty(
        transitiveObjectProperty: ITransitiveObjectProperty
        ): void
    {
        const predicateSymbol = transitiveObjectProperty.ObjectPropertyExpression.Select(this.PropertyExpressionInterpreter)
        this._rules.push([[predicateSymbol, '?x', '?z'], [[predicateSymbol, '?x', '?y'], [predicateSymbol, '?y', '?z']]]);
    }

    SubDataPropertyOf(
        subDataPropertyOf: ISubDataPropertyOf
        ): void
    {
        this._rules.push([[subDataPropertyOf.SuperDataPropertyExpression.Select(this.PropertyExpressionInterpreter), '?x', '?y'], [[subDataPropertyOf.SubDataPropertyExpression.Select(this.PropertyExpressionInterpreter), '?x', '?y']]]);
    }

    EquivalentDataProperties(
        equivalentDataProperties: IEquivalentDataProperties
        ): void
    {
        for(const dataPropertyExpression1 of equivalentDataProperties.DataPropertyExpressions)
            for(const dataPropertyExpression2 of equivalentDataProperties.DataPropertyExpressions)
                if(dataPropertyExpression1 !== dataPropertyExpression2)
                    this._rules.push([[dataPropertyExpression1.Select(this.PropertyExpressionInterpreter), '?x', '?y'], [[dataPropertyExpression2.Select(this.PropertyExpressionInterpreter), '?x', '?y']]]);
    }

    DataPropertyDomain(
        dataPropertyDomain: IDataPropertyDomain
        ): void
    {
        if(this._isClassExpression.IClass(dataPropertyDomain.Domain))
            this._rules.push([[dataPropertyDomain.Domain.Select(this.ClassExpressionInterpreter), '?x'], [[dataPropertyDomain.DataPropertyExpression.Select(this.PropertyExpressionInterpreter), '?x',]]]);
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
        if(dlSafeRule.Head.length === 1)
        {
            const headAtom = dlSafeRule.Head[0];
            if((isAtom.IClassAtom(headAtom) && this._isAxiom.IEntity(headAtom.ClassExpression)) || (isAtom.IPropertyAtom(headAtom) && this._isAxiom.IEntity(headAtom.PropertyExpression)))
            this._rules.push([<Idb>headAtom.Select(this.AtomInterpreter), dlSafeRule.Body.map(atom => atom.Select(this.AtomInterpreter))]);
        }
    }

    Class(
        class$: IClass
        ): void
    {
        this._rules.push([[class$.Select(this.ClassExpressionInterpreter), '?x'], [['?x', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', class$.Iri]]]);
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

    Individual(
        individual: IIndividual
        ): any
    {
        return this._individualInterpretation.get(individual);
    }

    private Property(
        property: IProperty
        ): void
    {
        this._rules.push([[property.Select(this.PropertyExpressionInterpreter), '?x', '?y'], [['?x', property.LocalName, '?y']]]);
    }
}
