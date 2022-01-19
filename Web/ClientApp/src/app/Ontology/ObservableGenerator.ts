import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { AddIndividuals } from "./AddIndividuals";
import { EavStore } from './EavStore';
import { Group } from './Group';
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
import { IDataPropertyExpression, IPropertyExpression } from "./IPropertyExpression";
import { TransitiveClosure3 } from "./TransitiveClosure";

export function GroupBy<T, TKey, TValue, TResult>(
    iterable      : Iterable<T>,
    keySelector   : (t: T) => TKey,
    valueSelector : (t: T) => TValue,
    resultSelector: (key: TKey, valueIterable: Iterable<TValue>) => TResult
    ): Iterable<TResult>
{
    return {
        *[Symbol.iterator]()
        {
            const map = Group(
                iterable,
                keySelector,
                valueSelector);

            for(const pair of map)
                yield resultSelector(
                    pair[0],
                    pair[1]);
        }
    };
}

export function GroupJoin<TLeft, TRight, TKey>(
    leftIterable    : Iterable<TLeft>,
    rightIterable   : Iterable<TRight>,
    leftKeySelector : (left: TLeft) => TKey,
    rightKeySelector: (right: TRight) => TKey
    ): Map<TLeft, TRight[]>
{
    const map = Group(
        rightIterable,
        rightKeySelector,
        (t: TRight) => t);

    const join = new Map<TLeft, TRight[]>();
    const empty: TRight[] = [];
    for(const left of leftIterable)
    {
        const rights = map.get(leftKeySelector(left));
        join.set(
            left,
            rights ? rights : empty);
    }

    return join;
}

export { IEavStore, EavStore };

export class ObservableGenerator implements IClassExpressionSelector<Observable<Set<any>>>
{
    private _classDefinitions         : Map<IClass, IClassExpression[]>;
    private _functionalDataProperties = new Set<IDataPropertyExpression>();
    private _classObservables         = new Map<IClass, Observable<Set<any>>>();
    private _individualInterpretation : Map<IIndividual, any>;
    private _objectDomain             : Observable<Set<any>>;

    private static _nothing = new BehaviorSubject<Set<any>>(new Set<any>()).asObservable();

    constructor(
        private _ontology: IOntology,
        private _store   : IEavStore
        )
    {
        this._objectDomain = this._store.ObserveEntities();

        for(const functionalDataProperty of this._ontology.Get(this._ontology.IsAxiom.IFunctionalDataProperty))
            this._functionalDataProperties.add(functionalDataProperty.DataPropertyExpression);

        const classes = [...this._ontology.Get(this._ontology.IsAxiom.IClass)];
        const adjacencyList = new Map<IClass, Set<IClass>>(classes.map(class$ => [class$, new Set<IClass>()]));
        for(const equivalentClassExpressions of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
        {
            const equivalentClasses = <IClass[]>equivalentClassExpressions.ClassExpressions.filter(classExpression => this._ontology.IsAxiom.IClass(classExpression));
            for(let index1 = 0; index1 < equivalentClasses.length; ++index1)
                for(let index2 = index1; index2 < equivalentClasses.length; ++index2)
                {
                    const class1 = equivalentClasses[index1];
                    const class2 = equivalentClasses[index2];
                    adjacencyList.get(class1).add(class2);
                    adjacencyList.get(class2).add(class1);
                }
        }

        const transitiveClosure = TransitiveClosure3(adjacencyList);

        const definitions: [IClass, IClassExpression][] = [];
        for(const equivalentClasses of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
            for(const class$ of equivalentClasses.ClassExpressions.filter(classExpression => this._ontology.IsAxiom.IClass(classExpression)))
            {
                for(const classExpression of equivalentClasses.ClassExpressions.filter(classExpression => !this._ontology.IsAxiom.IClass(classExpression)))
                    for(const equivalentClass of transitiveClosure.get(<IClass>class$))
                        definitions.push(
                            [
                                equivalentClass,
                                classExpression
                            ]);
                break;
            }

        this._classDefinitions = Group(
            definitions,
            definition => definition[0],
            definition => definition[1]);

        this._individualInterpretation = AddIndividuals(
            this._ontology,
            this._store);
    }

    Class(
        class$: IClass
        ): Observable<Set<any>>
    {
        let classObservable = this._classObservables.get(class$);
        if(!classObservable)
        {
            const classDefinitions = this._classDefinitions.get(class$);
            if(classDefinitions)
            {
                classObservable = classDefinitions[0].Select(this);
                this._classObservables.set(
                    class$,
                    classObservable);
            }
            else
            {
                const subClassExpressions = [...this._ontology.Get(this._ontology.IsAxiom.ISubClassOf)]
                    .filter(subClassOf => subClassOf.SuperClassExpression === class$)
                    .map(subClassOf => subClassOf.SubClassExpression);

                if(subClassExpressions.length)
                    classObservable = combineLatest(
                        subClassExpressions.map(classExpression => classExpression.Select(this)),
                        (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs])));

                else
                    classObservable = ObservableGenerator._nothing;
            }

            this._classObservables.set(
                class$,
                classObservable);
        }

        return classObservable;
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): Observable<Set<any>>
    {
        return combineLatest(
            objectIntersectionOf.ClassExpressions.map(classExpression => classExpression.Select(this)),
            (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs].filter(element => rhs.has(element)))));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        ): Observable<Set<any>>
    {
        return combineLatest(
            objectUnionOf.ClassExpressions.map(classExpression => classExpression.Select(this)),
            (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs])));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        ): Observable<Set<any>>
    {
        return combineLatest(
            this._objectDomain,
            objectComplementOf.ClassExpression.Select(this),
            (objectDomain, classExpression) => new Set<any>([...objectDomain].filter(element => !classExpression.has(element))));
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): Observable<Set<any>>
    {
        return new BehaviorSubject<Set<any>>(new Set<any>(objectOneOf.Individuals.map(individual => this.InterpretIndividual(individual))));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        ): Observable<Set<any>>
    {
        return combineLatest(
            this.ObservePropertyExpression(objectSomeValuesFrom.ObjectPropertyExpression),
            objectSomeValuesFrom.ClassExpression.Select(this),
            (objectPropertyExpression, classExpression) =>
                new Set<any>(
                    objectPropertyExpression
                        .filter(([,range]) => classExpression.has(range))
                        .map(([domain,]) => domain)));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        ): Observable<Set<any>>
    {
        const groupedByDomain = combineLatest(
            this._objectDomain,
            this.ObservePropertyExpression(objectAllValuesFrom.ObjectPropertyExpression),
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain));

        return combineLatest(
            groupedByDomain,
            objectAllValuesFrom.ClassExpression.Select(this),
            (groupedByDomain, classExpression) =>
                new Set<any>(
                    [...groupedByDomain.entries()]
                        .filter(([, relations]) => relations.every(([, range]) => classExpression.has(range)))
                        .map(([domain,]) => domain)));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): Observable<Set<any>>
    {
        const individual = this.InterpretIndividual(objectHasValue.Individual);
        return this.ObservePropertyExpression(objectHasValue.ObjectPropertyExpression).pipe(
            map(objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(([, range]) => range === individual)
                    .map(([domain,]) => domain))));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): Observable<Set<any>>
    {
        return this.ObservePropertyExpression(objectHasSelf.ObjectPropertyExpression).pipe(
            map(objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(([domain, range]) => domain === range)
                    .map(([domain,]) => domain))));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): Observable<Set<any>>
    {
        if(objectMinCardinality.Cardinality === 0)
            return this._objectDomain;

        let observableObjectPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(objectMinCardinality.ObjectPropertyExpression);
        if(objectMinCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                objectMinCardinality.ClassExpression.Select(this),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(([, range]) => classExpression.has(range)));

        if(objectMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return observableObjectPropertyExpression.pipe(
                map(objectPropertyExpression => new Set<any>(objectPropertyExpression.map(([domain,]) => domain))));

        return observableObjectPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(([, relations]) => relations.length >= objectMinCardinality.Cardinality)
                    .map(([domain,]) => domain))));
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        ): Observable<Set<any>>
    {
        let observableObjectPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(objectMaxCardinality.ObjectPropertyExpression);
        if(objectMaxCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this.ClassExpression(objectMaxCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(([, range]) => classExpression.has(range)));

        return combineLatest(
            this._objectDomain,
            observableObjectPropertyExpression,
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain)).pipe(
                        map(groupedByDomain =>
                            new Set<any>([...groupedByDomain.entries()]
                                .filter(([, relations]) => relations.length <= objectMaxCardinality.Cardinality)
                                .map(([domain,]) => domain))));
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        ): Observable<Set<any>>
    {
        let observableObjectPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(objectExactCardinality.ObjectPropertyExpression);
        if(objectExactCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this.ClassExpression(objectExactCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(([, range]) => classExpression.has(range)));

        if(objectExactCardinality.Cardinality === 0)
            return combineLatest(
                this._objectDomain,
                observableObjectPropertyExpression,
                (objectDomain, objectPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        objectPropertyExpression,
                        individual => individual,
                        ([domain,]) => domain)).pipe(
                            map(groupedByDomain =>
                                new Set<any>([...groupedByDomain.entries()]
                                    .filter(([, relations]) => relations.length === objectExactCardinality.Cardinality)
                                    .map(([domain,]) => domain))));

        return observableObjectPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(([, relations]) => relations.length === objectExactCardinality.Cardinality)
                    .map(([domain,]) => domain))));
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        ): Observable<Set<any>>
    {
        return this.ObservePropertyExpression(dataSomeValuesFrom.DataPropertyExpression).pipe(
            map(dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(([,range]) => dataSomeValuesFrom.DataRange.HasMember(range))
                    .map(([domain,]) => domain))));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        ): Observable<Set<any>>
    {
        return combineLatest(
            this._objectDomain,
            this.ObservePropertyExpression(dataAllValuesFrom.DataPropertyExpression),
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain)).pipe(
                        map(groupedByDomain => new Set<any>(
                            [...groupedByDomain.entries()]
                                .filter(([, relations]) => relations.every(([,range]) => dataAllValuesFrom.DataRange.HasMember(range)))
                                .map(([domain,]) => domain))));
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): Observable<Set<any>>
    {
        return this.ObservePropertyExpression(dataHasValue.DataPropertyExpression).pipe(
            map(dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(([, range]) => range === dataHasValue.Value)
                    .map(([domain,]) => domain))));
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        ): Observable<Set<any>>
    {
        if(dataMinCardinality.Cardinality === 0)
            return this._objectDomain;

        let observableDataPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(dataMinCardinality.DataPropertyExpression);
        if(dataMinCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataMinCardinality.DataRange.HasMember(range))));

        if(dataMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => new Set<any>(dataPropertyExpression.map(([domain,]) => domain))));

        return observableDataPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(([, relations]) => relations.length >= dataMinCardinality.Cardinality)
                    .map(([domain,]) => domain))));
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        ): Observable<Set<any>>
    {
        let observableDataPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(dataMaxCardinality.DataPropertyExpression);
        if(dataMaxCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataMaxCardinality.DataRange.HasMember(range))));

        return combineLatest(
            this._objectDomain,
            observableDataPropertyExpression,
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    ([domain,]) => domain)).pipe(
                        map(groupedByDomain =>
                            new Set<any>([...groupedByDomain.entries()]
                                .filter(([, relations]) => relations.length <= dataMaxCardinality.Cardinality)
                                .map(([domain,]) => domain))));
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        ): Observable<Set<any>>
    {
        let observableDataPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(dataExactCardinality.DataPropertyExpression);
        if(dataExactCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(([, range]) => dataExactCardinality.DataRange.HasMember(range))));

        if(dataExactCardinality.Cardinality === 0)
            return combineLatest(
                this._objectDomain,
                observableDataPropertyExpression,
                (objectDomain, dataPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        dataPropertyExpression,
                        individual => individual,
                        ([domain,]) => domain)).pipe(
                            map(groupedByDomain =>
                                new Set<any>([...groupedByDomain.entries()]
                                    .filter(([, relations]) => relations.length === dataExactCardinality.Cardinality)
                                    .map(([domain,]) => domain))));

        if(dataExactCardinality.Cardinality === 1 && this._functionalDataProperties.has(dataExactCardinality.DataPropertyExpression))
            // Optimise for Functional Data Properties.
            return observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => new Set<any>(dataPropertyExpression.map(([domain,]) => domain))));

        return observableDataPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(([, relations]) => relations.length === dataExactCardinality.Cardinality)
                    .map(([domain,]) => domain))));
    }

    get ObjectDomain(): Observable<Set<any>>
    {
        return this._objectDomain;
    }

    private ObservePropertyExpression(
        propertyExpression: IPropertyExpression
        ): Observable<[any, any][]>
    {
        return this._store.ObserveAttribute(propertyExpression.LocalName);
    }

    ClassExpression(
        classExpression: IClassExpression
        ): Observable<Set<any>>
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
