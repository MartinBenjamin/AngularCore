import { LongestPaths } from "./AdjacencyList";
import { ClassExpressionNavigator } from "./ClassExpressionNavigator";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { ClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IHasKey } from "./IHasKey";
import { IDataPropertyAssertion, INamedIndividual, IObjectPropertyAssertion } from "./INamedIndividual";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

function Group<T, TKey, TValue>(
    iterable     : Iterable<T>,
    keyAccessor  : (t: T) => TKey,
    valueAccessor: (t: T) => TValue
    ): Map<TKey, TValue[]>
{
    let map = new Map<TKey, TValue[]>();
    for(let t of iterable)
    {
        let key    = keyAccessor(t);
        let value  = valueAccessor(t);
        let values = map.get(key);
        if(values)
            values.push(value);

        else
            map.set(
                key,
                [value])
    }
    return map;
}

class ClassVisitor extends ClassExpressionVisitor
{
    private readonly _action: (class$: IClass) => { };

    constructor(
        action: (class$: IClass) => {}
        )
    {
        super();
        this._action = action;
    }

    Visit(
        class$: IClass
        )
    {
        this._action(class$);
    }
}

export class ClassMembershipEvaluator implements IClassMembershipEvaluator
{
    private readonly _ontology                 : IOntology;
    private readonly _classes                  = new Map<string, IClass>();
    private readonly _classAssertions          : Map<INamedIndividual, IClassExpression[]>;
    private readonly _objectPropertyAssertions : Map<INamedIndividual, IObjectPropertyAssertion[]>;
    private readonly _dataPropertyAssertions   : Map<INamedIndividual, IDataPropertyAssertion[]>;
    private readonly _hasKeys                  : Map<IClassExpression, IHasKey[]>;
    private readonly _superClassExpressions    : Map<IClassExpression, IClassExpression[]>;
    private readonly _subClassExpressions      : Map<IClassExpression, IClassExpression[]>;
    private readonly _disjointClassExpressions : Map<IClassExpression, IClassExpression[]>;
    private readonly _functionalDataProperties = new Set<IDataPropertyExpression>();
    private readonly _classDefinitions         : Map<IClass, IClassExpression[]>;
    private readonly _definedClasses           : IClass[];
    private readonly _objectPropertyExpressions: Map<IClassExpression, IObjectPropertyExpression[]>;
    private readonly _classifications          : Map<object, Set<IClass>>;

    constructor(
        ontology        : IOntology,
        classifications?: Map<object, Set<IClass>>
        )
    {
        this._ontology        = ontology;
        this._classifications = classifications;

        if(!this._classifications)
            this._classifications = new Map<object, Set<IClass>>();

        for(let class$ of ontology.Get(ontology.IsAxiom.IClass))
            this._classes.set(
                class$.Iri,
                class$);

        this._classAssertions = Group(
            ontology.Get(ontology.IsAxiom.IClassAssertion),
            classAssertion => classAssertion.NamedIndividual,
            classAssertion => classAssertion.ClassExpression);
        this._objectPropertyAssertions = Group(
            ontology.Get(ontology.IsAxiom.IObjectPropertyAssertion),
            objectPropertyAssertion => objectPropertyAssertion.SourceIndividual,
            objectPropertyAssertion => objectPropertyAssertion);
        this._dataPropertyAssertions = Group(
            ontology.Get(ontology.IsAxiom.IDataPropertyAssertion),
            dataPropertyAssertion => dataPropertyAssertion.SourceIndividual,
            dataPropertyAssertion => dataPropertyAssertion);
        this._hasKeys = Group(
            ontology.Get(ontology.IsAxiom.IHasKey),
            hasKey => hasKey.ClassExpression,
            hasKey => hasKey);
        this._superClassExpressions = Group(
            ontology.Get(ontology.IsAxiom.ISubClassOf),
            subClassOf => subClassOf.SubClassExpression,
            subClassOf => subClassOf.SuperClassExpression);
        this._subClassExpressions = Group(
            ontology.Get(ontology.IsAxiom.ISubClassOf),
            subClassOf => subClassOf.SuperClassExpression,
            subClassOf => subClassOf.SubClassExpression);
        this._objectPropertyExpressions = Group(
            ontology.Get(ontology.IsAxiom.IObjectPropertyDomain),
            objectPropertyDomain => objectPropertyDomain.Domain,
            objectPropertyDomain => objectPropertyDomain.ObjectPropertyExpression);

        let disjointPairs: [IClassExpression, IClassExpression][] = [];
        for(let disjointClasses of ontology.Get(ontology.IsAxiom.IDisjointClasses))
            for(let classExpression1 of disjointClasses.ClassExpressions)
                for(let classExpression2 of disjointClasses.ClassExpressions)
                    if(classExpression1 !== classExpression2)
                        disjointPairs.push(
                            [
                                classExpression1,
                                classExpression2
                            ]);

        for(let index = 0; index < disjointPairs.length; ++index)
        {
            let [classExpression1, classExpression2] = disjointPairs[index];
            this._subClassExpressions.get(classExpression2).forEach(
                subclassExpression => disjointPairs.push(
                    [
                        classExpression1,
                        subclassExpression
                    ]));
        }

        this._disjointClassExpressions = Group(
            disjointPairs,
            disjointPair => disjointPair[0],
            disjointPair => disjointPair[1]);

        for(let functionalDataProperty of ontology.Get(ontology.IsAxiom.IFunctionalDataProperty))
            this._functionalDataProperties.add(functionalDataProperty.DataPropertyExpression);

        let definitions: [IClass, IClassExpression][] = [];
        for(let equivalentClasses of ontology.Get(ontology.IsAxiom.IEquivalentClasses))
            for(let class$ of equivalentClasses.ClassExpressions.filter(classExpression => ontology.IsAxiom.IClass(classExpression)))
                for(let classExpression of equivalentClasses.ClassExpressions.filter(classExpression => !ontology.IsAxiom.IClass(classExpression)))
                    definitions.push(
                        [
                            <IClass>class$,
                            classExpression
                        ]);
        this._classDefinitions = Group(
            definitions,
            definition => definition[0],
            definition => definition[1]);

        let adjacent: Set<IClass> = null;
        let empty = new Set<IClass>();
        var adjacencyList = new Map<IClass, Set<IClass>>();
        for(let class$ of ontology.Get(ontology.IsAxiom.IClass))
            adjacencyList.set(
                class$,
                empty);

        let classVisitor = new ClassExpressionNavigator(new ClassVisitor(class$ => adjacent.add(class$)));

        for(let [class$, classExpression] of this._classDefinitions)
        {
            adjacent = new Set<IClass>();
            classExpression[0].Accept(classVisitor);
            adjacencyList.set(
                class$,
                adjacent);
        }

        let longestPaths = LongestPaths(adjacencyList);
        this._definedClasses = Array.from(this._classDefinitions.keys())
            .sort((a, b) => longestPaths.get(b) - longestPaths.get(a));
    }

    Class(
        class$    : IClass,
        individual: object
        ): boolean
    {
        return this.Classify(individual).has(class$);
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf,
        individual          : object
        ): boolean
    {
        return objectIntersectionOf.ClassExpressions.every(classExpression => classExpression.Evaluate(
            this,
            individual));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf,
        individual   : object
        ): boolean
    {
        return objectUnionOf.ClassExpressions.some(classExpression => classExpression.Evaluate(
            this,
            individual));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf,
        individual        : object
        ): boolean
    {
        return !objectComplementOf.ClassExpression.Evaluate(
            this,
            individual);
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf,
        individual : object
        ): boolean
    {
        return objectOneOf.Individuals.some(
            member => this.AreEqual(
                individual,
                member));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom,
        individual          : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectSomeValuesFrom.ObjectPropertyExpression,
            individual).some(
                value => objectSomeValuesFrom.ClassExpression.Evaluate(
                    this,
                    value));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom,
        individual         : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectAllValuesFrom.ObjectPropertyExpression,
            individual).every(
                value => objectAllValuesFrom.ClassExpression.Evaluate(
                    this,
                    value));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue,
        individual    : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectHasValue.ObjectPropertyExpression,
            individual).some(
                value => this.AreEqual(
                    objectHasValue.Individual,
                    value));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf,
        individual   : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectHasSelf.ObjectPropertyExpression,
            individual).some(
                value => this.AreEqual(
                    individual,
                    value));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality,
        individual          : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectMinCardinality.ObjectPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !objectMinCardinality.ClassExpression ||
                    objectMinCardinality.ClassExpression.Evaluate(
                        this,
                        value) ? count + 1 : count,
                0) >= objectMinCardinality.Cardinality;
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality,
        individual          : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectMaxCardinality.ObjectPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !objectMaxCardinality.ClassExpression ||
                    objectMaxCardinality.ClassExpression.Evaluate(
                        this,
                        value) ? count + 1 : count,
                0) <= objectMaxCardinality.Cardinality;
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality,
        individual            : object
        ): boolean
    {
        return this.ObjectPropertyValues(
            objectExactCardinality.ObjectPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !objectExactCardinality.ClassExpression ||
                    objectExactCardinality.ClassExpression.Evaluate(
                        this,
                        value) ? count + 1 : count,
                0) === objectExactCardinality.Cardinality;
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom,
        individual        : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataSomeValuesFrom.DataPropertyExpression,
            individual).some(value => dataSomeValuesFrom.DataRange.HasMember(value));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom,
        individual       : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataAllValuesFrom.DataPropertyExpression,
            individual).every(value => dataAllValuesFrom.DataRange.HasMember(value));
    }

    DataHasValue(
        dataHasValue: IDataHasValue,
        individual  : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataHasValue.DataPropertyExpression,
            individual).includes(dataHasValue.Value);
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality,
        individual        : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataMinCardinality.DataPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !dataMinCardinality.DataRange ||
                    dataMinCardinality.DataRange.HasMember(value) ? count + 1 : count,
                0) >= dataMinCardinality.Cardinality;
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality,
        individual        : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataMaxCardinality.DataPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !dataMaxCardinality.DataRange ||
                    dataMaxCardinality.DataRange.HasMember(value) ? count + 1 : count,
                0) <= dataMaxCardinality.Cardinality;
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality,
        individual          : object
        ): boolean
    {
        return this.DataPropertyValues(
            dataExactCardinality.DataPropertyExpression,
            individual).reduce(
                (count: number, value: object) =>
                    !dataExactCardinality.DataRange ||
                    dataExactCardinality.DataRange.HasMember(value) ? count + 1 : count,
                0) === dataExactCardinality.Cardinality;
    }

    Classify(
        individual: object
        ): Set<IClass>
    {
        let classes = this._classifications.get(individual);
        if(classes)
            return classes;

        classes = new Set<IClass>();
        this._classifications.set(
            individual,
            classes);

        let candidates = new Set<IClass>();

        if(this._ontology.IsAxiom.INamedIndividual(individual))
        {
            let assertedClassExpressions = this._classAssertions.get(individual);
            if(assertedClassExpressions)
                assertedClassExpressions
                    .forEach(assertedClassExpression => this.ApplyClassExpression(
                        classes,
                        candidates,
                        individual,
                        assertedClassExpression));
        }
        else if('ClassIri' in individual)
        {
            let class$ = this._classes.get(individual['ClassIri']);
            if(class$)
                this.ApplyClassExpression(
                    classes,
                    candidates,
                    individual,
                    class$);
        }

        for(let definedClass of this._definedClasses)
            if(candidates.has(definedClass) &&
                this._classDefinitions.get(definedClass)[0].Evaluate(
                    this,
                    individual))
                this.ApplyClassExpression(
                    classes,
                    candidates,
                    individual,
                    definedClass);

        return classes;
    }

    private ApplyClassExpression(
        classes         : Set<IClass>,
        candidates      : Set<IClass>,
        individual      : object,
        classExpression : IClassExpression
        ): void
    {
        if(this._ontology.IsAxiom.IClass(classExpression))
        {
            if(classes.has(classExpression))
                // Class Expression already processed.
                return;

            classes.add(classExpression);

            // Prune candidates.
            candidates.delete(classExpression);

            let disjointClassExpressions = this._disjointClassExpressions.get(classExpression);
            if(disjointClassExpressions)
                for(let disjointClassExpression of disjointClassExpressions)
                    if(this._ontology.IsAxiom.IClass(disjointClassExpression))
                        candidates.delete(disjointClassExpression);;


            let superClassExpressions = this._superClassExpressions.get(classExpression);
            if(superClassExpressions)
                superClassExpressions.forEach(superClassExpression => this.ApplyClassExpression(
                    classes,
                    candidates,
                    individual,
                    superClassExpression));
        }

        //if(this._ontology.IsAxiom.IclassExpression is IObjectIntersectionOf objectIntersectionOf)
        //    objectIntersectionOf.ClassExpressions
        //        .ForEach(componentClassExpression => Classify(
        //            classExpressions,
        //            candidates,
        //            individual,
        //            componentClassExpression));
    }

    public ClassifyAll(
        individual: object,
        ): void
    {
        for(let class$ of this.Classify(individual))
        {
            let objectPropertyExpressions = this._objectPropertyExpressions.get(class$);
            if(objectPropertyExpressions)
                for(let objectPropertyExpression of objectPropertyExpressions)
                    for(let value of this.ObjectPropertyValues(
                        objectPropertyExpression,
                        individual))
                        this.ClassifyAll(value);
        }
    }

    public ObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        individual              : object
        ): object[]
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualObjectPropertyValues(
                objectPropertyExpression,
                individual);

        return this.PropertyValues(
            objectPropertyExpression,
            individual);
    }

    public DataPropertyValues(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): any[]
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualDataPropertyValues(
                dataPropertyExpression,
                individual);

        return this.PropertyValues(
            dataPropertyExpression,
            individual);
    }

    public PropertyValues(
        propertyExpression: IPropertyExpression,
        individual        : object
        ): any[]
    {
        if(propertyExpression.LocalName in individual)
        {
            let value = individual[propertyExpression.LocalName];
            return Array.isArray(value) ?
                value : value !== null ?
                    (typeof value[Symbol.iterator] != 'undefined' ? [...value] : [value]) : [];
        }

        return [];
    }

    private DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        individual            : object
        ): any
    {
        if(this._ontology.IsAxiom.INamedIndividual(individual))
            return this.NamedIndividualDataPropertyValue(
                dataPropertyExpression,
                individual);

        return dataPropertyExpression.LocalName in individual ?
            individual[dataPropertyExpression.LocalName] : null;
    }

    private NamedIndividualObjectPropertyValues(
        objectPropertyExpression: IObjectPropertyExpression,
        namedIndividual         : INamedIndividual
        ): object[]
    {
        let objectPropertyAssertions = this._objectPropertyAssertions.get(namedIndividual);
        return objectPropertyAssertions ?
            objectPropertyAssertions
                .filter(objectPropertyAssertion => objectPropertyAssertion.ObjectPropertyExpression === objectPropertyExpression)
                .map(objectPropertyAssertion => objectPropertyAssertion.TargetIndividual) : [];
    }

    private NamedIndividualDataPropertyValues(
        dataPropertyExpression: IDataPropertyExpression,
        namedIndividual       : INamedIndividual
        ): any[]
    {
        let dataPropertyAssertions = this._dataPropertyAssertions.get(namedIndividual);
        return dataPropertyAssertions ?
            dataPropertyAssertions
                .filter(dataPropertyAssertion => dataPropertyAssertion.DataPropertyExpression === dataPropertyExpression)
                .map(dataPropertyAssertion => dataPropertyAssertion.TargetValue) : [];
    }

    private NamedIndividualDataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        namedIndividual       : INamedIndividual
        ): any
    {
        let values = this.NamedIndividualDataPropertyValues(
            dataPropertyExpression,
            namedIndividual);

        return values.length ? values[0] : null;
    }

    public AreEqual(
        lhs: object,
        rhs: object
        ): boolean
    {
        let lhsClassExpressions = this.Classify(lhs);
        let rhsClassExpressions = this.Classify(rhs);
        let hasKeys = [];
        [...lhsClassExpressions]
            .filter(lhsClassExpression => this._hasKeys.has(lhsClassExpression))
            .filter(lhsClassExpression => rhsClassExpressions.has(lhsClassExpression))
            .forEach(lhsClassExpression => hasKeys.push(...this._hasKeys.get(lhsClassExpression)))

        return hasKeys.length &&
            hasKeys.every(
                hasKey => hasKey.DataPropertyExpressions.every(
                    dataPropertyExpression => this.DataPropertyExpressionAreEqual(
                        dataPropertyExpression,
                        lhs,
                        rhs)));
    }

    private DataPropertyExpressionAreEqual(
        dataPropertyExpression: IDataPropertyExpression,
        lhs: object,
        rhs: object
        ): boolean
    {
        if(this._functionalDataProperties.has(dataPropertyExpression))
            return this.DataPropertyValue(
                dataPropertyExpression,
                lhs) === this.DataPropertyValue(
                    dataPropertyExpression,
                    rhs);
        else
        {
            let lhsValues = new Set<object>(this.DataPropertyValues(
                dataPropertyExpression,
                lhs));
            let rhsValues = new Set<object>(this.DataPropertyValues(
                dataPropertyExpression,
                rhs));

            return lhsValues.size === rhsValues.size &&
                [...lhsValues].every(lhsValue => rhsValues.has(lhsValue));
        }
    }
}
