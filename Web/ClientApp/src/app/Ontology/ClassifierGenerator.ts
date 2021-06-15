import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { LongestPaths } from "./AdjacencyList";
import { ClassExpressionNavigator } from './ClassExpressionNavigator';
import { ClassVisitor } from "./ClassMembershipEvaluator";
import { Group } from './Group';
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
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
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";
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

export function GroupByDomain(
    relations: Iterable<[any, any]>
    ): Map<any, Set<any>>
{
    let map = new Map<any, Set<any>>();
    for(let relation of relations)
    {
        let values = map.get(relation[0]);
        if(values)
            values.add(relation[1]);

        else
            map.set(
                relation[0],
                new Set<any>().add(relation[1]));
    }
    return map;
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

export interface IStore
{
    ObjectDomain: Observable<Set<any>>;
    ObjectPropertyExpression(objectPropertyExpression: IObjectPropertyExpression): Observable<[any, any][]>;
    DataPropertyExpression(dataPropertyExpression: IDataPropertyExpression): Observable<[any, any][]>;
}

export class Store implements IStore
{
    ObjectDomain: Observable<Set<any>>;

    ObjectPropertyExpression(
        objectPropertyExpression: IObjectPropertyExpression
        ): Observable<[any, any][]>
    {
        throw new Error("Method not implemented.");
    }

    DataPropertyExpression(
        dataPropertyExpression: IDataPropertyExpression
        ): Observable<[any, any][]>
    {
        throw new Error("Method not implemented.");
    }
}

class StoreDecorator implements IStore
{
    constructor(
        private _ontology : IOntology,
        private _decorated: IStore
        )
    {
    }

    get ObjectDomain(): Observable<Set<any>>
    {
        const individuals = [...this._ontology.Get(this._ontology.IsAxiom.INamedIndividual)];

        if(!individuals.length)
            return this._decorated.ObjectDomain;

        else
            return combineLatest(
                this._decorated.ObjectDomain,
                new BehaviorSubject<any[]>(individuals.map(individual => this.InterpretIndividual(individual))),
                (lhs, rhs) => new Set<any>([...lhs, ...rhs]));
    }

    ObjectPropertyExpression(
        objectPropertyExpression: IObjectPropertyExpression
        ): Observable<[any, any][]>
    {
        const objectPropertyAssertions = [...this._ontology.Get(this._ontology.IsAxiom.IObjectPropertyAssertion)]
            .filter(objectPropertyAssertion => objectPropertyAssertion.ObjectPropertyExpression === objectPropertyExpression);

        if(!objectPropertyAssertions.length)
            return this._decorated.ObjectPropertyExpression(objectPropertyExpression);

        return combineLatest(
            this._decorated.ObjectPropertyExpression(objectPropertyExpression),
            new BehaviorSubject<[any, any][]>(objectPropertyAssertions.map(objectPropertyAssertion =>
                [this.InterpretIndividual(objectPropertyAssertion.SourceIndividual),
                this.InterpretIndividual(objectPropertyAssertion.TargetIndividual)])),
            (lhs, rhs) =>
            {
                const map = GroupByDomain(lhs);
                const combined = [].concat(lhs);
                for(const relation of rhs)
                {
                    var values = map.get(relation[0])
                    if(!values)
                    {
                        values = new Set<any>().add(relation[1]);
                        map.set(
                            relation[0],
                            values);
                        combined.push(relation);
                    }
                    else if(!values.has(relation[1]))
                    {
                        values.add(relation[1]);
                        combined.push(relation);
                    }
                }
                return combined;
            });
    }

    DataPropertyExpression(
        dataPropertyExpression: IDataPropertyExpression
        ): Observable<[any, any][]>
    {
        const dataPropertyAssertions = [...this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion)]
            .filter(dataPropertyAssertion => dataPropertyAssertion.DataPropertyExpression === dataPropertyExpression);

        if(!dataPropertyAssertions.length)
            return this._decorated.DataPropertyExpression(dataPropertyExpression);

        return combineLatest(
            this._decorated.DataPropertyExpression(dataPropertyExpression),
            new BehaviorSubject<[any, any][]>(dataPropertyAssertions.map(dataPropertyAssertion =>
                [this.InterpretIndividual(dataPropertyAssertion.SourceIndividual), dataPropertyAssertion.TargetValue])),
            (lhs, rhs) =>
            {
                const map = GroupByDomain(lhs);
                const combined = [].concat(lhs);
                for(const relation of rhs)
                {
                    var values = map.get(relation[0])
                    if(!values)
                    {
                        values = new Set<any>().add(relation[1]);
                        map.set(
                            relation[0],
                            values);
                        combined.push(relation);
                    }
                    else if(!values.has(relation[1]))
                    {
                        values.add(relation[1]);
                        combined.push(relation);
                    }
                }
                return lhs;
            });
    }
    
    private InterpretIndividual(
        individual: object
        ): any
    {
        for(const dataPropertyAssertion of this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression.LocalName === "Id" &&
                dataPropertyAssertion.SourceIndividual === individual)
                return dataPropertyAssertion.TargetValue;

        return individual;
    }
}

export class ClassifierGenerator implements IClassExpressionVisitor
{
    private _ontology        : IOntology;
    private _objectDomain    : Subject<Set<any>>;
    private _properties      : Map<string, Subject<[any, any][]>>;
    private _classes         : Map<IClassExpression, Observable<Set<any>>>;
    private _classDefinitions: Map<IClass, IClassExpression[]>;
    private _definedClasses  : IClass[];

    constructor()
    {
    }

    Class(
        class$: IClass
        )
    {
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        )
    {
        this._classes.set(
            objectIntersectionOf,
            combineLatest(
                objectIntersectionOf.ClassExpressions.map(classExpression => this._classes.get(classExpression)),
                (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs, ...rhs]))));
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        )
    {
        this._classes.set(
            objectUnionOf,
            combineLatest(
                objectUnionOf.ClassExpressions.map(classExpression => this._classes.get(classExpression)),
                (...sets) => sets.reduce((lhs, rhs) => new Set<any>([...lhs].filter(member => rhs.has(member))))));
    }

    ObjectComplementOf(
        objectComplementOf: IObjectComplementOf
        )
    {
        this._classes.set(
            objectComplementOf,
            combineLatest(
                this._objectDomain,
                this._classes.get(objectComplementOf.ClassExpression),
                (objectDomain, classExpression) => new Set<any>([...objectDomain].filter(member => !classExpression.has(member)))));
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        )
    {
        this._classes.set(
            objectOneOf,
            new BehaviorSubject<Set<any>>(new Set<any>(objectOneOf.Individuals.map(individual => this.InterpretIndividual(individual)))));
    }

    ObjectSomeValuesFrom(
        objectSomeValuesFrom: IObjectSomeValuesFrom
        )
    {
        this._classes.set(
            objectSomeValuesFrom,
            combineLatest(
                this.PropertyExpression(objectSomeValuesFrom.ObjectPropertyExpression),
                this._classes.get(objectSomeValuesFrom.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    new Set<any>(
                        objectPropertyExpression
                            .filter(member => classExpression.has(member[1]))
                            .map(member => member[0]))));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        )
    {
        this._classes.set(
            objectAllValuesFrom,
            combineLatest(
                this.PropertyExpression(objectAllValuesFrom.ObjectPropertyExpression).pipe(map(this.GroupByDomain)),
                this._classes.get(objectAllValuesFrom.ClassExpression),
                (groupedByDomain, classExpression) =>
                    new Set<any>(
                        [...groupedByDomain.entries()]
                            .filter(entry => entry[1].every(individual => classExpression.has(individual)))
                            .map(entry => entry[0]))));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        )
    {
        const individual = this.InterpretIndividual(objectHasValue.Individual);
        this._classes.set(
            objectHasValue,
            this.PropertyExpression(objectHasValue.ObjectPropertyExpression).pipe(
                map(objectPropertyExpression =>
                    new Set<any>(objectPropertyExpression
                        .filter(member => member[1] === individual)
                        .map(member => member[0])))));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        )
    {
        this._classes.set(
            objectHasSelf,
            this.PropertyExpression(objectHasSelf.ObjectPropertyExpression).pipe(
                map(objectPropertyExpression =>
                    new Set<any>(objectPropertyExpression
                        .filter(member => member[0] === member[1])
                        .map(member => member[0])))));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        )
    {
        if(objectMinCardinality.Cardinality === 0)
        {
            // All individuals.
            this._classes.set(
                objectMinCardinality,
                this._objectDomain);

            return;
        }

        let observableObjectPropertyExpression = this.PropertyExpression(objectMinCardinality.ObjectPropertyExpression);
        if(objectMinCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this._classes.get(objectMinCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        if(objectMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            this._classes.set(
                objectMinCardinality,
                observableObjectPropertyExpression.pipe(
                    map(objectPropertyExpression => new Set<any>(objectPropertyExpression.map(member => member[0])))));

        else
            this._classes.set(
                objectMinCardinality,
                observableObjectPropertyExpression.pipe(
                    map(this.GroupByDomain),
                    map(groupedByDomain =>
                        new Set<any>([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length >= objectMinCardinality.Cardinality)
                            .map(entry => entry[0])))));
    }

    ObjectMaxCardinality(
        objectMaxCardinality: IObjectMaxCardinality
        )
    {
        let observableObjectPropertyExpression = this.PropertyExpression(objectMaxCardinality.ObjectPropertyExpression);
        if(objectMaxCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this._classes.get(objectMaxCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        if(objectMaxCardinality.Cardinality == 0)
            this._classes.set(
                objectMaxCardinality,
                combineLatest(
                    this._objectDomain,
                    observableObjectPropertyExpression,
                    (objectDomain, objectPropertyExpression) =>
                        GroupJoin(
                            objectDomain,
                            objectPropertyExpression,
                            individual => individual,
                            member => member[0])).pipe(
                                map(groupedByDomain =>
                                    new Set<any>([...groupedByDomain.entries()]
                                        .filter(entry => entry[1].length <= objectMaxCardinality.Cardinality)
                                        .map(entry => entry[0])))));
        else
            this._classes.set(
                objectMaxCardinality,
                observableObjectPropertyExpression.pipe(
                    map(this.GroupByDomain),
                    map(groupedByDomain =>
                        new Set<any>([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length <= objectMaxCardinality.Cardinality)
                            .map(entry => entry[0])))));
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality
        )
    {
        let observableObjectPropertyExpression = this.PropertyExpression(objectExactCardinality.ObjectPropertyExpression);
        if(objectExactCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                this._classes.get(objectExactCardinality.ClassExpression),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(member => classExpression.has(member[1])));

        if(objectExactCardinality.Cardinality == 0)
            this._classes.set(
                objectExactCardinality,
                combineLatest(
                    this._objectDomain,
                    observableObjectPropertyExpression,
                    (objectDomain, objectPropertyExpression) =>
                    {
                        return GroupJoin(
                            objectDomain,
                            objectPropertyExpression,
                            individual => individual,
                            member => member[0]);
                    }).pipe(
                                map(groupedByDomain =>
                                {
                                    return new Set<any>([...groupedByDomain.entries()]
                                        .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                                        .map(entry => entry[0]));
                                })));
        else
            this._classes.set(
                objectExactCardinality,
                observableObjectPropertyExpression.pipe(
                    map(this.GroupByDomain),
                    map(groupedByDomain =>
                        new Set<any>([...groupedByDomain.entries()]
                            .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                            .map(entry => entry[0])))));
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        )
    {
        this._classes.set(
            dataSomeValuesFrom,
            this.PropertyExpression(dataSomeValuesFrom.DataPropertyExpression).pipe(
                map(dataPropertyExpression =>
                    new Set<any>(dataPropertyExpression
                        .filter(member => dataSomeValuesFrom.DataRange.HasMember(member[1]))))));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        )
    {
        this._classes.set(
            dataAllValuesFrom,
            this.PropertyExpression(dataAllValuesFrom.DataPropertyExpression).pipe(
                map(this.GroupByDomain),
                map(groupedByDomain =>
                    new Set<any>(
                        [...groupedByDomain.entries()]
                            .filter(entry => entry[1].every(value => dataAllValuesFrom.DataRange.HasMember(value)))
                            .map(entry => entry[0])))));
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        )
    {
        this._classes.set(
            dataHasValue,
            this.PropertyExpression(dataHasValue.DataPropertyExpression).pipe(
                map(dataPropertyExpression =>
                    new Set<any>(dataPropertyExpression
                        .filter(member => member[1] === dataHasValue.Value)
                        .map(member => member[0])))));
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        )
    {
        throw new Error("Method not implemented.");
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        )
    {
        throw new Error("Method not implemented.");
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        )
    {
        throw new Error("Method not implemented.");
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

    PropertyExpression(
        objectPropertyExpression: IPropertyExpression
        ): Observable<[any, any][]>
    {
        let subject = this._properties.get(objectPropertyExpression.LocalName);
        if(!subject)
        {
            subject = new BehaviorSubject<[any, any][]>([]);
            this._properties.set(
                objectPropertyExpression.LocalName,
                subject);
        }
        return subject;
    }

    private InterpretIndividual(
        individual: object
        ): any
    {
        for(const dataPropertyAssertion of this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression.LocalName === 'Id' &&
                dataPropertyAssertion.SourceIndividual === individual)
                return dataPropertyAssertion.TargetValue;

        return individual;
    }

    Generate(
        onology: IOntology
        ): [Subject<Set<any>>, Map<string, Subject<[any, any][]>>, Map<IClassExpression, Observable<Set<any>>>]
    {
        this._ontology     = onology;
        this._objectDomain = new BehaviorSubject<Set<any>>(new Set<any>());
        this._properties   = new Map<string, BehaviorSubject<[any, any][]>>();
        this._classes      = new Map<IClassExpression, Observable<Set<any>>>();

        let classes = [...this._ontology.Get(this._ontology.IsAxiom.IClass)];
        let adjacencyList = new Map<IClass, Set<IClass>>(classes.map(class$ => [class$, new Set<IClass>()]));
        for(let equivalentClassExpressions of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
        {
            let equivalentClasses = <IClass[]>equivalentClassExpressions.ClassExpressions.filter(classExpression => this._ontology.IsAxiom.IClass(classExpression));
            for(let index1 = 0; index1 < equivalentClasses.length; ++index1)
                for(let index2 = index1; index2 < equivalentClasses.length; ++index2)
                {
                    let class1 = equivalentClasses[index1];
                    let class2 = equivalentClasses[index2];
                    adjacencyList.get(class1).add(class2);
                    adjacencyList.get(class2).add(class1);
                }
        }

        let transitiveClosure = TransitiveClosure3(adjacencyList);

        let definitions: [IClass, IClassExpression][] = [];
        for(let equivalentClasses of this._ontology.Get(this._ontology.IsAxiom.IEquivalentClasses))
            for(let class$ of equivalentClasses.ClassExpressions.filter(classExpression => this._ontology.IsAxiom.IClass(classExpression)))
            {
                for(let classExpression of equivalentClasses.ClassExpressions.filter(classExpression => !this._ontology.IsAxiom.IClass(classExpression)))
                    for(let equivalentClass of transitiveClosure.get(<IClass>class$))
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

        let adjacent: Set<IClass> = null;
        let empty = new Set<IClass>();
        adjacencyList = new Map<IClass, Set<IClass>>(classes.map(class$ => [class$, empty]));
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
        this._definedClasses = [...this._classDefinitions.keys()]
            .sort((a, b) => longestPaths.get(b) - longestPaths.get(a));

        const navigator = new ClassExpressionNavigator(
            null,
            this);

        for(let definedClass of this._definedClasses)
        {
            const definition = this._classDefinitions.get(definedClass)[0];
            definition.Accept(navigator);
            this._classes.set(
                definedClass,
                this._classes.get(definition));
        }

        return [this._objectDomain, this._properties, this._classes];
    }
}
