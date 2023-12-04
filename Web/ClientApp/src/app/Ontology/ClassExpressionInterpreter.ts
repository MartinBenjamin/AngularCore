import { Group, GroupJoin } from '../Collections/Group';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from "../EavStore/IEavStore";
import { TransitiveClosure3 } from "../Graph/TransitiveClosure";
import { AddIndividuals } from "./AddIndividuals";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
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
import { Wrap, Wrapped, WrapperType } from './Wrapped';

export interface ICache<T extends WrapperType, K = any, V = any>
{
    set(
        key: K,
        wrapped: Wrapped<T, V>): void;
    get(key: K): Wrapped<T, V>;
}

export abstract class ClassExpressionInterpreter<T extends WrapperType> implements IClassExpressionSelector<Wrapped<T, Set<any>>>
{
    private _equivalentClasses          : Map<IClass, Set<IClass>>;
    private _classDefinitions           : Map<IClass, IClassExpression[]>;
    private _functionalObjectProperties = new Set<IObjectPropertyExpression>();
    private _functionalDataProperties   = new Set<IDataPropertyExpression>();
    private _individualInterpretation   : Map<IIndividual, any>;

    protected abstract WrapObjectDomain(): Wrapped<T, Set<any>>;

    constructor(
        private   _wrap                         : Wrap<T>,
        private   _propertyExpressionInterpreter: IPropertyExpressionSelector<Wrapped<T, readonly [any, any][]>>,
        private   _ontology                     : IOntology,
        protected _store                        : IEavStore,
        private   _classInterpretation          : ICache<T, IClass, Set<any>>
        )
    {
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

    get PropertyExpressionInterpreter(): IPropertyExpressionSelector<Wrapped<T, readonly [any, any][]>>
    {
        return this._propertyExpressionInterpreter;
    }

    Class(
        class$: IClass
        ): Wrapped<T, Set<any>>
    {
        let interpretation = this._classInterpretation.get(class$);
        if(!interpretation)
        {
            let interpretations: Wrapped<T, Set<any>>[];
            switch(class$)
            {
                case Thing  : interpretations = [this.WrapObjectDomain()        ]; break;
                case Nothing: interpretations = [this._wrap(() => new Set<any>())]; break;
                default:
                    let classDefinitions = this._classDefinitions.get(class$) || [];

                    interpretations = classDefinitions.map(classExpression => classExpression.Select(this));

                    for(const equivalentClass of this._equivalentClasses.get(class$))
                    {
                        interpretations = interpretations.concat([...this._ontology.Get(this._ontology.IsAxiom.ISubClassOf)]
                            .filter(subClassOf => subClassOf.SuperClassExpression === equivalentClass)
                            .map(subClassOf => subClassOf.SubClassExpression.Select(this)));

                        interpretations = interpretations.concat(
                            [...this._ontology.Get(this._ontology.IsAxiom.IObjectPropertyDomain)]
                                .filter(objectPropertyDomain => objectPropertyDomain.Domain === equivalentClass)
                                .map(objectPropertyDomain => objectPropertyDomain.ObjectPropertyExpression)
                                .map(objectPropertyExpression => this._wrap(
                                    relations => new Set<any>(relations.map(([domain,]) => domain)),
                                    objectPropertyExpression.Select(this._propertyExpressionInterpreter))));

                        interpretations = interpretations.concat(
                            [...this._ontology.Get(this._ontology.IsAxiom.IObjectPropertyRange)]
                                .filter(objectPropertyRange => objectPropertyRange.Range === equivalentClass)
                                .map(objectPropertyRange => objectPropertyRange.ObjectPropertyExpression)
                                .map(objectPropertyExpression => this._wrap(
                                    relations => new Set<any>(relations.map(([, range]) => range)),
                                    objectPropertyExpression.Select(this._propertyExpressionInterpreter))));

                        interpretations = interpretations.concat(
                            [...this._ontology.Get(this._ontology.IsAxiom.IDataPropertyDomain)]
                                .filter(dataPropertyDomain => dataPropertyDomain.Domain === equivalentClass)
                                .map(dataPropertyDomain => dataPropertyDomain.DataPropertyExpression)
                                .map(dataPropertyExpression => this._wrap(
                                    relations => new Set<any>(relations.map(([domain,]) => domain)),
                                    dataPropertyExpression.Select(this._propertyExpressionInterpreter))));
                    }
            }

            if(!interpretations.length)
                interpretation = this.Class(Nothing);

            else if(interpretations.length === 1)
                interpretation = interpretations[0];

            else
                interpretation = this._wrap(
                    (...sets: Set<any>[]) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs])),
                    ...interpretations);

            this._classInterpretation.set(
                class$,
                interpretation);
        }

        return interpretation;
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): Wrapped<T, Set<any>>
    {
        return this._wrap((...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs].filter(element => rhs.has(element)))),
            ...objectIntersectionOf.ClassExpressions.map(classExpression => classExpression.Select(this)));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        ): Wrapped<T, Set<any>>
    {
        return this._wrap((...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs])),
            ...objectUnionOf.ClassExpressions.map(classExpression => classExpression.Select(this)));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        ): Wrapped<T, Set<any>>
    {
        return this._wrap(
            (objectDomain, classExpression) => new Set<any>([...objectDomain].filter(element => !classExpression.has(element))),
            this.Class(Thing),
            objectComplementOf.ClassExpression.Select(this));
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): Wrapped<T, Set<any>>
    {
        return this._wrap(() => new Set<any>(objectOneOf.Individuals.map(individual => this.InterpretIndividual(individual))));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        ): Wrapped<T, Set<any>>
    {
        return this._wrap(
            (objectPropertyExpression, classExpression) =>
                new Set<any>(
                    objectPropertyExpression
                        .filter(([, range]) => classExpression.has(range))
                        .map(([domain,]) => domain)),
            objectSomeValuesFrom.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter),
            objectSomeValuesFrom.ClassExpression.Select(this));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        ): Wrapped<T, Set<any>>
    {
        const groupedByDomain = this._wrap(
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this.Class(Thing),
            objectAllValuesFrom.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter));

        return this._wrap(
            (groupedByDomain, classExpression) =>
                new Set<any>(
                    [...groupedByDomain]
                        .filter(([, relations]) => relations.every(([, range]) => classExpression.has(range)))
                        .map(([domain,]) => domain)),
            groupedByDomain,
            objectAllValuesFrom.ClassExpression.Select(this));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): Wrapped<T, Set<any>>
    {
        const individual = this.InterpretIndividual(objectHasValue.Individual);
        return this._wrap(
            objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(([, range]) => range === individual)
                    .map(([domain,]) => domain)),
            objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): Wrapped<T, Set<any>>
    {
        return this._wrap(
            objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(([domain, range]) => domain === range)
                    .map(([domain,]) => domain)),
            objectHasSelf.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): Wrapped<T, Set<any>>
    {
        if(objectMinCardinality.Cardinality === 0)
            return this.Class(Thing);

        let objectPropertyExpression = objectMinCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(objectMinCardinality.ClassExpression)
            objectPropertyExpression = this._wrap(
                (objectPropertyExpression, classExpression) => objectPropertyExpression.filter(([, range]) => classExpression.has(range)),
                objectPropertyExpression,
                objectMinCardinality.ClassExpression.Select(this));

        if(objectMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return this._wrap(
                objectPropertyExpression => new Set<any>(objectPropertyExpression.map(([domain,]) => domain)),
                objectPropertyExpression);

        const groupedByDomain = this._wrap(this.GroupByDomain, objectPropertyExpression);
        return this._wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length >= objectMinCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        ): Wrapped<T, Set<any>>
    {
        let objectPropertyExpression = objectMaxCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(objectMaxCardinality.ClassExpression)
            objectPropertyExpression = this._wrap(
                (objectPropertyExpression, classExpression) => objectPropertyExpression.filter(([, range]) => classExpression.has(range)),
                objectPropertyExpression,
                objectMaxCardinality.ClassExpression.Select(this));

        const groupedByDomain = this._wrap(
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this.Class(Thing),
            objectPropertyExpression);

        return this._wrap(
            groupedByDomain => new Set<any>([...groupedByDomain]
                .filter(([, relations]) => relations.length <= objectMaxCardinality.Cardinality)
                .map(([domain,]) => domain)),
            groupedByDomain);
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        ): Wrapped<T, Set<any>>
    {
        let objectPropertyExpression = objectExactCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(objectExactCardinality.ClassExpression)
            objectPropertyExpression = this._wrap(
                (objectPropertyExpression, classExpression) => objectPropertyExpression.filter(([, range]) => classExpression.has(range)),
                objectPropertyExpression,
                objectExactCardinality.ClassExpression.Select(this));

        if(objectExactCardinality.Cardinality === 0)
        {
            const groupedByDomain = this._wrap(
                (objectDomain, objectPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        objectPropertyExpression,
                        individual => individual,
                        ([domain,]) => domain),
                this.Class(Thing),
                objectPropertyExpression);

            return this._wrap(
                groupedByDomain =>
                    new Set<any>([...groupedByDomain]
                        .filter(([, relations]) => relations.length === objectExactCardinality.Cardinality)
                        .map(([domain,]) => domain)),
                groupedByDomain);
        }

        if(objectExactCardinality.Cardinality === 1 && this._functionalObjectProperties.has(objectExactCardinality.ObjectPropertyExpression))
            // Optimise for Functional Object Properties.
            return this._wrap(
                objectPropertyExpression => new Set<any>(objectPropertyExpression.map(([domain,]) => domain)),
                objectPropertyExpression);

        const groupedByDomain = this._wrap(
            this.GroupByDomain,
            objectPropertyExpression);

        return this._wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length === objectExactCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        ): Wrapped<T, Set<any>>
    {
        return this._wrap(
            dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(([, range]) => dataSomeValuesFrom.DataRange.HasMember(range))
                    .map(([domain,]) => domain)),
            dataSomeValuesFrom.DataPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        ): Wrapped<T, Set<any>>
    {
        const groupedByDomain = this._wrap(
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this.Class(Thing),
            dataAllValuesFrom.DataPropertyExpression.Select(this._propertyExpressionInterpreter));

        return this._wrap(
            groupedByDomain => new Set<any>(
                [...groupedByDomain]
                    .filter(([, relations]) => relations.every(([, range]) => dataAllValuesFrom.DataRange.HasMember(range)))
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): Wrapped<T, Set<any>>
    {
        return this._wrap(
            dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(([, range]) => range === dataHasValue.Value)
                    .map(([domain,]) => domain)),
            dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        ): Wrapped<T, Set<any>>
    {
        if(dataMinCardinality.Cardinality === 0)
            return this.Class(Thing);

        let dataPropertyExpression = dataMinCardinality.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(dataMinCardinality.DataRange)
            dataPropertyExpression = this._wrap(
                dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataMinCardinality.DataRange.HasMember(range)),
                dataPropertyExpression);

        if(dataMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return this._wrap(
                dataPropertyExpression => new Set<any>(dataPropertyExpression.map(([domain,]) => domain)),
                dataPropertyExpression);

        const groupedByDomain = this._wrap(
            this.GroupByDomain,
            dataPropertyExpression);

        return this._wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length >= dataMinCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        ): Wrapped<T, Set<any>>
    {
        let dataPropertyExpression = dataMaxCardinality.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(dataMaxCardinality.DataRange)
            dataPropertyExpression = this._wrap(
                dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataMaxCardinality.DataRange.HasMember(range)),
                dataPropertyExpression);

        const groupedByDomain = this._wrap(
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this.Class(Thing),
            dataPropertyExpression);

        return this._wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length <= dataMaxCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        ): Wrapped<T, Set<any>>
    {
        let dataPropertyExpression = dataExactCardinality.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        if(dataExactCardinality.DataRange)
            dataPropertyExpression = this._wrap(
                dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataExactCardinality.DataRange.HasMember(range)),
                dataPropertyExpression);

        if(dataExactCardinality.Cardinality === 0)
        {
            const groupedByDomain = this._wrap(
                (objectDomain, dataPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        dataPropertyExpression,
                        individual => individual,
                        ([domain,]) => domain),
                this.Class(Thing),
                dataPropertyExpression);

            return this._wrap(
                groupedByDomain =>
                    new Set<any>([...groupedByDomain]
                        .filter(([, relations]) => relations.length === dataExactCardinality.Cardinality)
                        .map(([domain,]) => domain)),
                groupedByDomain);
        }

        if(dataExactCardinality.Cardinality === 1 && this._functionalDataProperties.has(dataExactCardinality.DataPropertyExpression))
            // Optimise for Functional Data Properties.
            return this._wrap(
                dataPropertyExpression => new Set<any>(dataPropertyExpression.map(([domain,]) => domain)),
                dataPropertyExpression);

        const groupedByDomain = this._wrap(
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain),
            this.Class(Thing),
            dataPropertyExpression);

        return this._wrap(
            groupedByDomain =>
                new Set<any>([...groupedByDomain]
                    .filter(([, relations]) => relations.length === dataExactCardinality.Cardinality)
                    .map(([domain,]) => domain)),
            groupedByDomain);
    }

    get ObjectDomain(): Wrapped<T, Set<any>>
    {
        return this.Class(Thing);
    }

    ClassExpression(
        classExpression: IClassExpression
        ): Wrapped<T, Set<any>>
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
        relations: readonly [any, any][]
        ): Map<any, any[]>
    {
        return Group(
            relations,
            relation => relation[0],
            relation => relation[1]);
    }
}
