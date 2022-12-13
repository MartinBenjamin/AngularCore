import { AddIndividuals } from "./AddIndividuals";
import { EavStore } from './EavStore';
import { Group, GroupJoin } from './Group';
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IEavStore } from "./IEavStore";
import { IIndividual } from "./IIndividual";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IOntology } from './IOntology';
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { Nothing } from './Nothing';
import { Thing } from './Thing';
import { TransitiveClosure3 } from "./TransitiveClosure";

export { IEavStore, EavStore };

export type Wrapped<TClass> = {};

export abstract class ClassExpressionInterpreter<TClass, TProperty> implements IClassExpressionSelector<TClass>
{
    private _equivalentClasses            : Map<IClass, Set<IClass>>;
    private _classDefinitions             : Map<IClass, IClassExpression[]>;
    private _functionalObjectProperties   = new Set<IObjectPropertyExpression>();
    private _functionalDataProperties     = new Set<IDataPropertyExpression>();
    private _classInterpretation          : Map<IClass, TClass>;
    private _individualInterpretation     : Map<IIndividual, any>;
    private _classExpressionInterpreter   : IClassExpressionSelector<Wrapped<Set<any>>>;
    private _propertyExpressionInterpreter: IPropertyExpressionSelector<Wrapped<[any, any][]>>;
    private _nothing                      : Wrapped<Set<any>>;
    private _objectDomain                 : Wrapped<Set<any>>;

    protected abstract Wrap<P extends any[], R>(map: (...params: P) => R,
        ...params: { [Parameter in keyof P]: Wrapped<P[Parameter]>; }): Wrapped<R>;

    constructor(
        propertyExpressionInterpreter: IPropertyExpressionSelector<TProperty>,
        private   _ontology          : IOntology,
        protected _store             : IEavStore,
        objectDomain                 : TClass
        )
    {
        this._classExpressionInterpreter = this;
        this._propertyExpressionInterpreter = propertyExpressionInterpreter;
        this._nothing = this.Wrap(() => new Set<any>());
        this._objectDomain = objectDomain;
        this._classInterpretation = new Map<IClass, TClass>(
            [
                [Thing  , <TClass>this._objectDomain],
                [Nothing, <TClass>this._nothing     ]
            ]);

        for(const functionalObjectProperty of this._ontology.Get(this._ontology.IsAxiom.IFunctionalObjectProperty))
            this._functionalObjectProperties.add(functionalObjectProperty.ObjectPropertyExpression);

        for(const functionalDataProperty of this._ontology.Get(this._ontology.IsAxiom.IFunctionalDataProperty))
            this._functionalDataProperties.add(functionalDataProperty.DataPropertyExpression);

        const classes = [...this._ontology.Get(this._ontology.IsAxiom.IClass)];
        const adjacencyList = new Map<IClass, Set<IClass>>(classes.map(class$ => [class$, new Set<IClass>([class$])]));
        for(const equivalentClassExpressions of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
        {
            const equivalentClasses = equivalentClassExpressions.ClassExpressions.filter(this._ontology.IsAxiom.IClass);
            for(let index1 = 0; index1 < equivalentClasses.length; ++index1)
                for(let index2 = index1; index2 < equivalentClasses.length; ++index2)
                {
                    const class1 = equivalentClasses[index1];
                    const class2 = equivalentClasses[index2];
                    adjacencyList.get(class1).add(class2);
                    adjacencyList.get(class2).add(class1);
                }
        }

        this._equivalentClasses = TransitiveClosure3(adjacencyList);

        const definitions: [IClass, IClassExpression][] = [];
        for(const equivalentClasses of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
            for(const class$ of equivalentClasses.ClassExpressions.filter(this._ontology.IsAxiom.IClass))
            {
                for(const classExpression of equivalentClasses.ClassExpressions.filter(classExpression => !this._ontology.IsAxiom.IClass(classExpression)))
                    for(const equivalentClass of this._equivalentClasses.get(class$))
                        definitions.push(
                            [
                                equivalentClass,
                                classExpression
                            ]);
                break;
            }

        this._classDefinitions = Group(
            definitions,
            ([class$,]) => class$,
            ([, classExpression]) => classExpression);

        this._individualInterpretation = AddIndividuals(
            this._ontology,
            this._store);
    }

    Class(
        class$: IClass
        ): TClass
    {
        let interpretation = this._classInterpretation.get(class$);
        if(!interpretation)
        {
            let classDefinitions = this._classDefinitions.get(class$) || [];

            let interpretations = classDefinitions.map(classExpression => classExpression.Select(this._classExpressionInterpreter));

            for(const equivalentClass of this._equivalentClasses.get(class$))
            {
                interpretations = interpretations.concat([...this._ontology.Get(this._ontology.IsAxiom.ISubClassOf)]
                    .filter(subClassOf => subClassOf.SuperClassExpression === equivalentClass)
                    .map(subClassOf => subClassOf.SubClassExpression.Select(this._classExpressionInterpreter)));

                interpretations = interpretations.concat(
                    [...this._ontology.Get(this._ontology.IsAxiom.IObjectPropertyDomain)]
                        .filter(objectPropertyDomain => objectPropertyDomain.Domain === equivalentClass)
                        .map(objectPropertyDomain => objectPropertyDomain.ObjectPropertyExpression)
                        .map(objectPropertyExpression => this.Wrap(
                            relations => new Set<any>(relations.map(([domain,]) => domain)),
                            objectPropertyExpression.Select(this._propertyExpressionInterpreter))));

                interpretations = interpretations.concat(
                    [...this._ontology.Get(this._ontology.IsAxiom.IObjectPropertyRange)]
                        .filter(objectPropertyRange => objectPropertyRange.Range === equivalentClass)
                        .map(objectPropertyRange => objectPropertyRange.ObjectPropertyExpression)
                        .map(objectPropertyExpression => this.Wrap(
                            relations => new Set<any>(relations.map(([, range]) => range)),
                            objectPropertyExpression.Select(this._propertyExpressionInterpreter))));

                interpretations = interpretations.concat(
                    [...this._ontology.Get(this._ontology.IsAxiom.IDataPropertyDomain)]
                        .filter(dataPropertyDomain => dataPropertyDomain.Domain === equivalentClass)
                        .map(dataPropertyDomain => dataPropertyDomain.DataPropertyExpression)
                        .map(dataPropertyExpression => this.Wrap(
                            relations => new Set<any>(relations.map(([domain,]) => domain)),
                            dataPropertyExpression.Select(this._propertyExpressionInterpreter))));
            }

            if(!interpretations.length)
                interpretation = <TClass>this._nothing;

            else if(interpretations.length === 1)
                interpretation = <TClass>interpretations[0];

            else
                interpretation = <TClass>this.Wrap(
                    (...sets: Set<any>[]) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs])),
                    interpretations);

            this._classInterpretation.set(
                class$,
                interpretation);
        }

        return interpretation;
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): TClass
    {
        return <TClass>this.Wrap((...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs].filter(element => rhs.has(element)))),
            ...objectIntersectionOf.ClassExpressions.map(classExpression => classExpression.Select(this._classExpressionInterpreter)));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        ): TClass
    {
        return <TClass>this.Wrap((...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs])),
            ...objectUnionOf.ClassExpressions.map(classExpression => classExpression.Select(this._classExpressionInterpreter)));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        ): TClass
    {
        return <TClass>this.Wrap(
            (objectDomain, classExpression) => new Set<any>([...objectDomain].filter(element => !classExpression.has(element))),
            this._objectDomain,
            objectComplementOf.ClassExpression.Select(this._classExpressionInterpreter));
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): TClass
    {
        return <TClass>this.Wrap(() => new Set<any>(objectOneOf.Individuals.map(individual => this.InterpretIndividual(individual))));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        ): TClass
    {
        return <TClass>this.Wrap(
            (objectPropertyExpression, classExpression) =>
                new Set<any>(
                    objectPropertyExpression
                        .filter(([, range]) => classExpression.has(range))
                        .map(([domain,]) => domain)),
            objectSomeValuesFrom.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter),
            objectSomeValuesFrom.ClassExpression.Select(this._classExpressionInterpreter));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        ): TClass
    {
        const groupedByDomain = this.Wrap(
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this._objectDomain,
            objectAllValuesFrom.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter));

        return <TClass>this.Wrap(
            (groupedByDomain, classExpression) =>
                new Set<any>(
                    [...groupedByDomain]
                        .filter(([, relations]) => relations.every(([, range]) => classExpression.has(range)))
                        .map(([domain,]) => domain)),
            groupedByDomain,
            objectAllValuesFrom.ClassExpression.Select(this._classExpressionInterpreter));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): TClass
    {
        const individual = this.InterpretIndividual(objectHasValue.Individual);
        return <TClass>this.Wrap(
            objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(([, range]) => range === individual)
                    .map(([domain,]) => domain)),
            objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): TClass
    {
        return <TClass>this.Wrap(
            objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(([domain, range]) => domain === range)
                    .map(([domain,]) => domain)),
            objectHasSelf.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): TClass
    {
        if(objectMinCardinality.Cardinality === 0)
            return <TClass>this._objectDomain;

        let objectPropertyExpression = objectMinCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(objectMinCardinality.ClassExpression)
            objectPropertyExpression = this.Wrap(
                (objectPropertyExpression, classExpression) => objectPropertyExpression.filter(([, range]) => classExpression.has(range)),
                objectPropertyExpression,
                objectMinCardinality.ClassExpression.Select(this._classExpressionInterpreter));

        if(objectMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return <TClass>this.Wrap(
                objectPropertyExpression => new Set<any>(objectPropertyExpression.map(([domain,]) => domain)),
                objectPropertyExpression);

        const groupedByDomain = this.Wrap(this.GroupByDomain, objectPropertyExpression);
        return <TClass>this.Wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length >= objectMinCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        ): TClass
    {
        let objectPropertyExpression = objectMaxCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(objectMaxCardinality.ClassExpression)
            objectPropertyExpression = this.Wrap(
                (objectPropertyExpression, classExpression) => objectPropertyExpression.filter(([, range]) => classExpression.has(range)),
                objectPropertyExpression,
                objectMaxCardinality.ClassExpression.Select(this._classExpressionInterpreter));

        const groupedByDomain = this.Wrap(
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this._objectDomain,
            objectPropertyExpression);

        return <TClass>this.Wrap(
            groupedByDomain => new Set<any>([...groupedByDomain]
                .filter(([, relations]) => relations.length <= objectMaxCardinality.Cardinality)
                .map(([domain,]) => domain)),
            groupedByDomain);
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        ): TClass
    {
        let objectPropertyExpression = objectExactCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(objectExactCardinality.ClassExpression)
            objectPropertyExpression = this.Wrap(
                (objectPropertyExpression, classExpression) => objectPropertyExpression.filter(([, range]) => classExpression.has(range)),
                objectPropertyExpression,
                objectExactCardinality.ClassExpression.Select(this._classExpressionInterpreter));

        if(objectExactCardinality.Cardinality === 0)
        {
            const groupedByDomain = this.Wrap(
                (objectDomain, objectPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        objectPropertyExpression,
                        individual => individual,
                        ([domain,]) => domain),
                this._objectDomain,
                objectPropertyExpression);

            return <TClass>this.Wrap(
                groupedByDomain =>
                    new Set<any>([...groupedByDomain]
                        .filter(([, relations]) => relations.length === objectExactCardinality.Cardinality)
                        .map(([domain,]) => domain)),
                groupedByDomain);
        }

        if(objectExactCardinality.Cardinality === 1 && this._functionalObjectProperties.has(objectExactCardinality.ObjectPropertyExpression))
            // Optimise for Functional Object Properties.
            return <TClass>this.Wrap(
                objectPropertyExpression => new Set<any>(objectPropertyExpression.map(([domain,]) => domain)),
                objectPropertyExpression);

        const groupedByDomain = this.Wrap(
            this.GroupByDomain,
            objectPropertyExpression);

        return <TClass>this.Wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length === objectExactCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        ): TClass
    {
        return <TClass>this.Wrap(
            dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(([, range]) => dataSomeValuesFrom.DataRange.HasMember(range))
                    .map(([domain,]) => domain)),
            dataSomeValuesFrom.DataPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        ): TClass
    {
        const groupedByDomain = this.Wrap(
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this._objectDomain,
            dataAllValuesFrom.DataPropertyExpression.Select(this._propertyExpressionInterpreter));

        return <TClass>this.Wrap(
            groupedByDomain => new Set<any>(
                [...groupedByDomain]
                    .filter(([, relations]) => relations.every(([, range]) => dataAllValuesFrom.DataRange.HasMember(range)))
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): TClass
    {
        return <TClass>this.Wrap(
            dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(([, range]) => range === dataHasValue.Value)
                    .map(([domain,]) => domain)),
            dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        ): TClass
    {
        if(dataMinCardinality.Cardinality === 0)
            return <TClass>this._objectDomain;

        let dataPropertyExpression = dataMinCardinality.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(dataMinCardinality.DataRange)
            dataPropertyExpression = this.Wrap(
                dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataMinCardinality.DataRange.HasMember(range)),
                dataPropertyExpression);

        if(dataMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return <TClass>this.Wrap(
                dataPropertyExpression => new Set<any>(dataPropertyExpression.map(([domain,]) => domain)),
                dataPropertyExpression);

        const groupedByDomain = this.Wrap(
            this.GroupByDomain,
            dataPropertyExpression);

        return <TClass>this.Wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length >= dataMinCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        ): TClass
    {
        let dataPropertyExpression = dataMaxCardinality.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(dataMaxCardinality.DataRange)
            dataPropertyExpression = this.Wrap(
                dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataMaxCardinality.DataRange.HasMember(range)),
                dataPropertyExpression);

        const groupedByDomain = this.Wrap(
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this._objectDomain,
            dataPropertyExpression);

        return <TClass>this.Wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length <= dataMaxCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        ): TClass
    {
        let dataPropertyExpression = dataExactCardinality.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(dataExactCardinality.DataRange)
            dataPropertyExpression = this.Wrap(
                dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataExactCardinality.DataRange.HasMember(range)),
                dataPropertyExpression);

        if(dataExactCardinality.Cardinality === 0)
        {
            const groupedByDomain = this.Wrap(
                (objectDomain, dataPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        dataPropertyExpression,
                        individual => individual,
                        ([domain,]) => domain),
                this._objectDomain,
                dataPropertyExpression);

            return <TClass>this.Wrap(
                groupedByDomain =>
                    new Set<any>([...groupedByDomain]
                        .filter(([, relations]) => relations.length === dataExactCardinality.Cardinality)
                        .map(([domain,]) => domain)),
                groupedByDomain);
        }

        if(dataExactCardinality.Cardinality === 1 && this._functionalDataProperties.has(dataExactCardinality.DataPropertyExpression))
            // Optimise for Functional Data Properties.
            return <TClass>this.Wrap(
                dataPropertyExpression => new Set<any>(dataPropertyExpression.map(([domain,]) => domain)),
                dataPropertyExpression);

        const groupedByDomain = this.Wrap(
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this._objectDomain,
            dataPropertyExpression);

        return <TClass>this.Wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length === dataExactCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    get ObjectDomain(): TClass
    {
        return <TClass>this._objectDomain;
    }

    ClassExpression(
        classExpression: IClassExpression
        ): TClass
    {
        return classExpression.Select(this);
    }

    InterpretIndividual(
        individual: IIndividual
        ): any
    {
        return this._individualInterpretation.get(individual);
    }

    private GroupByDomain(
        relations: [any, any][]
        ): Map<any, any[]>
    {
        return Group(
            relations,
            relation => relation[0],
            relation => relation[1]);
    }
}
