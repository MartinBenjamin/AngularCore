import { Rule, Variable } from "../EavStore/Datalog";
import { IEavStore } from "../EavStore/IEavStore";
import { AddIndividuals } from "./AddIndividuals";
import { ClassAtom, ClassExpressionInterpreter } from "./ClassExpressionInterpreterDatalog";
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
import { ISubClassOf } from "./ISubClassOf";
import { ISubDataPropertyOf } from "./ISubDataPropertyOf";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";
import { ISymmetricObjectProperty } from "./ISymmetricObjectProperty";
import { ITransitiveObjectProperty } from "./ITransitiveObjectProperty";
import { PropertyAtom } from "./PropertyExpressionInterpreterDatalog";

export class AxiomInterpreter implements IAxiomVisitor
{
    private readonly _domain    : Variable = '?x';
    private readonly _range     : Variable = '?y';
    private readonly _individual: Variable = '?x';

    private _individualInterpretation: ReadonlyMap<IIndividual, any>;
    private _classExpressionInterpreter: IClassExpressionSelector<ClassAtom> = new ClassExpressionInterpreter(
        this._individual,
        this._rules);
    private _propertyExpressionInterpreter: IPropertyExpressionSelector<PropertyAtom>;// = new PropertyExpressionInterpreter('?x', '?y')

    constructor(
        private _ontology: IOntology,
        private _store   : IEavStore,
        private _rules   : Rule[]
        )
    {
        this._individualInterpretation = AddIndividuals(
            this._ontology,
            this._store);
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

    HasKey(
        hasKey: IHasKey
        ): void
    {
    }

    SubClassOf(
        subClassOf: ISubClassOf
        ): void
    {
        const superClassExpression = subClassOf.SuperClassExpression;
        if(this._ontology.IsClassExpression.IClass(superClassExpression))
            this._rules.push([[superClassExpression.Iri, this._individual], [subClassOf.SubClassExpression.Select(this._classExpressionInterpreter)]])
    }

    EquivalentClasses(
        equivalentClasses: IEquivalentClasses
        ): void
    {
        for(const classExpression1 of equivalentClasses.ClassExpressions)
            for(const classExpression2 of equivalentClasses.ClassExpressions)
                if(classExpression1 !== classExpression2 && this._ontology.IsClassExpression.IClass(classExpression1))
                    this._rules.push([[classExpression1.Iri, this._individual], [classExpression2.Select(this._classExpressionInterpreter)]]);
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
        if(this._ontology.IsClassExpression.IClass(classAssertion.ClassExpression))
            this._rules.push([[classAssertion.ClassExpression.Iri, this._individualInterpretation.get(classAssertion.Individual)], []]);
    }

    ObjectPropertyAssertion(
        objectPropertyAssertion: IObjectPropertyAssertion
        ): void
    {
    }

    DataPropertyAssertion(
        dataPropertyAssertion: IDataPropertyAssertion
        ): void
    {
    }

    SubObjectPropertyOf(
        subObjectPropertyOf: ISubObjectPropertyOf
        ): void
    {
        const superObjectPropertyExpression = subObjectPropertyOf.SuperObjectPropertyExpression;
        if(this._ontology.IsAxiom.IObjectProperty(superObjectPropertyExpression))
            this._rules.push([[superObjectPropertyExpression.Iri, this._domain, this._range], [subObjectPropertyOf.SubObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]])
    }

    EquivalentObjectProperties(
        equivalentObjectProperties: IEquivalentObjectProperties
        ): void
    {
        for(const objectPropertyExpression1 of equivalentObjectProperties.ObjectPropertyExpressions)
            for(const objectPropertyExpression2 of equivalentObjectProperties.ObjectPropertyExpressions)
                if(objectPropertyExpression1 !== objectPropertyExpression2 && this._ontology.IsAxiom.IObjectProperty(objectPropertyExpression1))
                    this._rules.push([[objectPropertyExpression1.Iri, this._domain, this._range], [objectPropertyExpression2.Select(this._propertyExpressionInterpreter)]])
    }

    InverseObjectProperties(
        inverseObjectProperties: IInverseObjectProperties
        ): void
    {
        const objectPropertyExpression1 = inverseObjectProperties.ObjectPropertyExpression1;
        const objectPropertyExpression2 = inverseObjectProperties.ObjectPropertyExpression2;
        if(this._ontology.IsAxiom.IObjectProperty(objectPropertyExpression1))
            this._rules.push([[objectPropertyExpression1.Iri, this._range, this._domain], [objectPropertyExpression2.Select(this._propertyExpressionInterpreter)]])
        if(this._ontology.IsAxiom.IObjectProperty(objectPropertyExpression2))
            this._rules.push([[objectPropertyExpression2.Iri, this._range, this._domain], [objectPropertyExpression1.Select(this._propertyExpressionInterpreter)]])
    }

    ObjectPropertyDomain(
        objectPropertyDomain: IObjectPropertyDomain
        ): void
    {
        const domain = objectPropertyDomain.Domain;
        if(this._ontology.IsAxiom.IClass(domain))
            this._rules.push([[domain.Iri, this._domain], [objectPropertyDomain.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]])
    }

    ObjectPropertyRange(
        objectPropertyRange: IObjectPropertyRange
        ): void
    {
        const range = objectPropertyRange.Range;
        if(this._ontology.IsAxiom.IClass(range))
            this._rules.push([[range.Iri, this._range], [objectPropertyRange.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]])
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
        const objectPropertyExpression = symmetricObjectProperty.ObjectPropertyExpression;
        if(this._ontology.IsAxiom.IObjectProperty(objectPropertyExpression))
        {
            const iri = objectPropertyExpression.Iri;
            this._rules.push([[iri, '?x', '?y'], [[iri, '?y', '?x']]]);
        }
    }

    TransitiveObjectProperty(
        transitiveObjectProperty: ITransitiveObjectProperty
        ): void
    {
        const objectPropertyExpression = transitiveObjectProperty.ObjectPropertyExpression;
        if(this._ontology.IsAxiom.IObjectProperty(objectPropertyExpression))
        {
            const iri = objectPropertyExpression.Iri;
            this._rules.push([[iri, '?x', '?z'], [[iri, '?x', '?y'], [iri, '?y', '?z']]]);
        }
    }

    SubDataPropertyOf(
        subDataPropertyOf: ISubDataPropertyOf
        ): void
    {
        const superDataPropertyExpression = subDataPropertyOf.SuperDataPropertyExpression;
        if(this._ontology.IsAxiom.IDataProperty(superDataPropertyExpression))
            this._rules.push([[superDataPropertyExpression.Iri, this._domain, this._range], [subDataPropertyOf.SubDataPropertyExpression.Select(this._propertyExpressionInterpreter)]])
    }

    EquivalentDataProperties(
        equivalentDataProperties: IEquivalentDataProperties
        ): void
    {
        for(const dataPropertyExpression1 of equivalentDataProperties.DataPropertyExpressions)
            for(const dataPropertyExpression2 of equivalentDataProperties.DataPropertyExpressions)
                if(dataPropertyExpression1 !== dataPropertyExpression2 && this._ontology.IsAxiom.IDataProperty(dataPropertyExpression1))
                    this._rules.push([[dataPropertyExpression1.Iri, this._domain, this._range], [dataPropertyExpression2.Select(this._propertyExpressionInterpreter)]])
    }

    DataPropertyDomain(
        dataPropertyDomain: IDataPropertyDomain
        ): void
    {
        const domain = dataPropertyDomain.Domain;
        if(this._ontology.IsAxiom.IClass(domain))
            this._rules.push([[domain.Iri, this._domain], [dataPropertyDomain.DataPropertyExpression.Select(this._propertyExpressionInterpreter)]])
    }

    DataPropertyRange(
        dataPropertyRange: IDataPropertyRange
        ): void
    {
        const range = dataPropertyRange.Range;
        if(this._ontology.IsAxiom.IClass(range))
            this._rules.push([[range.Iri, this._range], [dataPropertyRange.DataPropertyExpression.Select(this._propertyExpressionInterpreter)]])
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
        this._rules.push([[class$.Iri, '?x'], [['?x', 'rdf:type', class$.Iri]]]);
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

    Datatype(
        datatype: IDatatype
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
        this._rules.push([[property.Iri, '?x', '?y'], [['?x', property.LocalName, '?y']]]);
    }
}
