import { Idb, Rule, Variable } from "../EavStore/Datalog";
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
import { ISubClassOf } from "./ISubClassOf";
import { ISubDataPropertyOf } from "./ISubDataPropertyOf";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";
import { ISymmetricObjectProperty } from "./ISymmetricObjectProperty";
import { ITransitiveObjectProperty } from "./ITransitiveObjectProperty";
import { PropertyExpressionInterpreter } from "./PropertyExpressionInterpreterDatalog";

export class AxiomInterpreter implements IAxiomVisitor
{
    private readonly _domain    : Variable = '?x';
    private readonly _range     : Variable = '?y';
    private readonly _individual: Variable = '?x';

    private _individualInterpretation     = new Map<IIndividual, any>();
    private _classExpressionInterpreter   : IClassExpressionSelector<Idb>;
    private _propertyExpressionInterpreter: IPropertyExpressionSelector<Idb>;

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
            this._individual,
            this._individualInterpretation,
            this._rules);
        this._propertyExpressionInterpreter = new PropertyExpressionInterpreter(
            this._domain,
            this._range);
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
        if(this._ontology.IsClassExpression.IClass(subClassOf.SuperClassExpression))
            this._rules.push([[subClassOf.SuperClassExpression.Iri, this._individual], [subClassOf.SubClassExpression.Select(this._classExpressionInterpreter)]])
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
            this._rules.push([[classAssertion.ClassExpression.Iri, this.InterpretIndividual(classAssertion.Individual)], []]);
    }

    ObjectPropertyAssertion(
        objectPropertyAssertion: IObjectPropertyAssertion
        ): void
    {
    //    if(this._ontology.IsAxiom.IObjectProperty(objectPropertyAssertion.ObjectPropertyExpression))
    //        this._rules.push([[objectPropertyAssertion.ObjectPropertyExpression.Iri, this.InterpretIndividual(objectPropertyAssertion.SourceIndividual), this.InterpretIndividual(objectPropertyAssertion.TargetIndividual)], []]);
    }

    DataPropertyAssertion(
        dataPropertyAssertion: IDataPropertyAssertion
        ): void
    {
    //    if(this._ontology.IsAxiom.IDataProperty(dataPropertyAssertion.DataPropertyExpression))
    //        this._rules.push([[dataPropertyAssertion.DataPropertyExpression.Iri, this.InterpretIndividual(dataPropertyAssertion.SourceIndividual), dataPropertyAssertion.TargetValue], []]);
    }

    SubObjectPropertyOf(
        subObjectPropertyOf: ISubObjectPropertyOf
        ): void
    {
        if(this._ontology.IsAxiom.IObjectProperty(subObjectPropertyOf.SuperObjectPropertyExpression))
            this._rules.push([[subObjectPropertyOf.SuperObjectPropertyExpression.Iri, this._domain, this._range], [subObjectPropertyOf.SubObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]])
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
        if(this._ontology.IsClassExpression.IClass(objectPropertyDomain.Domain))
            this._rules.push([[objectPropertyDomain.Domain.Iri, this._domain], [objectPropertyDomain.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]])
    }

    ObjectPropertyRange(
        objectPropertyRange: IObjectPropertyRange
        ): void
    {
        if(this._ontology.IsClassExpression.IClass(objectPropertyRange.Range))
            this._rules.push([[objectPropertyRange.Range.Iri, this._range], [objectPropertyRange.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]])
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
        if(this._ontology.IsAxiom.IDataProperty(subDataPropertyOf.SuperDataPropertyExpression))
            this._rules.push([[subDataPropertyOf.SuperDataPropertyExpression.Iri, this._domain, this._range], [subDataPropertyOf.SubDataPropertyExpression.Select(this._propertyExpressionInterpreter)]])
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
        if(this._ontology.IsClassExpression.IClass(dataPropertyDomain.Domain))
            this._rules.push([[dataPropertyDomain.Domain.Iri, this._domain], [dataPropertyDomain.DataPropertyExpression.Select(this._propertyExpressionInterpreter)]])
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
        this._rules.push([[class$.Iri, '?x'], [['?x', 'rdf:type', class$.Iri]]]);
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
        this._rules.push([[property.Iri, '?x', '?y'], [['?x', property.LocalName, '?y']]]);
    }
}
