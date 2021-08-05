import { BehaviorSubject, combineLatest, Observable, Subscriber } from "rxjs";
import { map } from 'rxjs/operators';
import { Group } from './Group';
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { AttributeSchema, Cardinality } from "./IEavStore";
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

export interface IStore
{
    ObjectDomain: Observable<Set<any>>;
    ObserveProperty(property: string): Observable<[any, any][]>;
    NewEntity(): any;
    Add(
        entity  : object,
        property: string,
        value   : any);
    Remove(
        entity  : object,
        property: string,
        value: any);
    Import(object: object): any;
}

export class Store implements IStore
{
    private _objectDomain        : BehaviorSubject<Set<any>>;
    private _ave                 : Map<string, Map<any, any>>;
    private _propertySubscribers = new Map<string, Subscriber<[any, any][]>[]>();
    private _schema              : Map<string, AttributeSchema>;

    constructor(
        attributeSchema?: AttributeSchema[],
        objectDomain   ?: Set<any>
        )
    {
        this._schema = new Map<string, AttributeSchema>((attributeSchema || []).map(attributeSchema => [attributeSchema.Name, attributeSchema]));
        this._ave = new Map<string, Map<any, any>>(
            [...this._schema.values()]
                .filter(attributeSchema => attributeSchema.UniqueIdentity)
                .map(attributeSchema => [attributeSchema.Name, new Map<any, any>()]));
        this._objectDomain = new BehaviorSubject(objectDomain || new Set<any>());
    }

    get ObjectDomain(): Observable<Set<any>>
    {
        return this._objectDomain;
    }

    ObserveProperty(
        property: string
        ): Observable<[any, any][]>
    {
        return new Observable<[any, any][]>(
            subscriber =>
            {
                let subscribers = this._propertySubscribers.get(property);
                if(!subscribers)
                {
                    subscribers = [];
                    this._propertySubscribers.set(
                        property,
                        subscribers);
                }

                subscribers.push(subscriber);
                subscriber.next(this.PropertyValues(property));

                subscriber.add(
                    () =>
                    {
                        const index = subscribers.indexOf(subscriber);

                        if(index != -1)
                            subscribers.splice(
                                index,
                                1);

                        if(!subscribers.length)
                            this._propertySubscribers.delete(property);
                    });
            });
    }

    NewEntity(): any
    {
        const objectDomain = this._objectDomain.getValue();
        const entity: any = {};
        objectDomain.add(entity);
        this._objectDomain.next(objectDomain);
        return entity;
    }

    Add(
        entity  : object,
        property: string,
        value   : any
        )
    {
        let currentValue = entity[property];

        if(typeof currentValue === 'undefined' && this.Cardinality(property) === Cardinality.Many)
            currentValue = entity[property] = [];

        if(currentValue instanceof Array)
            currentValue.push(value);

        else
            entity[property] = value;

        this.Publish(property);
    }

    Remove(
        entity  : object,
        property: string,
        value   : any
        )
    {
        let currentValue = entity[property];

        if(currentValue instanceof Array)
            currentValue.splice(
                currentValue.indexOf(value),
                1);

        else
            delete entity[property];

        this.Publish(property);
    }

    Import(
        object: object
        ): any
    {
        if(typeof object !== 'object' ||
            object === null ||
            object instanceof Date)
            return object;

        if(this._objectDomain.getValue().has(object))
            return object;

        let entity: any;
        [...this._ave]
            .filter(([attribute,]) => attribute in object)
            .forEach(([attribute,ve]) =>
            {
                if(typeof entity === 'undefined')
                    entity = ve.get(object[attribute]);

                else if(entity != ve[object[attribute]])
                    throw 'Unique Identity Conflict';
            });

        if(!entity)
            entity = this.NewEntity();

        else for(const key in object)
        {
            const value = object[key];
            if(value instanceof Array)
            {
                if(!entity[key])
                    entity[key] = [];

                entity[key].push(...value
                    .map(element => this.Import(element))
                    .filter(element => !entity[key].includes(element)));
            }
            else
                entity[key] = this.Import(value);
        }

        return entity;
    }

    private Cardinality(
        property: string
        ): Cardinality
    {
        const attributeSchema = this._schema.get(property);
        if(attributeSchema && typeof attributeSchema.Cardinality !== 'undefined')
            return attributeSchema.Cardinality;

        return Cardinality.Many;
    }

    private Publish(
        property: string
        )
    {
        const subscribers = this._propertySubscribers.get(property);
        if(subscribers)
        {
            const propertyValues = this.PropertyValues(property);
            subscribers.forEach(subscriber => subscriber.next(propertyValues));
        }
    }

    private PropertyValues(
        property: string
        ): [any, any][]
    {
        const list: [any, any][] = [];
        for(const entity of this._objectDomain.getValue())
            if(property in entity)
            {
                const value = entity[property];
                if(value instanceof Array)
                    list.push(...value.map<[any, any]>(value => [entity, value]));

                else if(value !== null)
                    list.push([entity, value]);
            }
        return list;
    }
}

export class ObservableGenerator implements IClassExpressionSelector<Observable<Set<any>>>
{
    private _classDefinitions         : Map<IClass, IClassExpression[]>;
    private _functionalDataProperties = new Set<IDataPropertyExpression>();
    private _classObservables         = new Map<IClass, Observable<Set<any>>>();
    private _individualInterpretation : Map<IIndividual, any>;

    private static _nothing = new BehaviorSubject<Set<any>>(new Set<any>()).asObservable();

    constructor(
        private _ontology: IOntology,
        private _store  ?: IStore
        )
    {
        if(!this._store)
            this._store = new Store();

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

        this._individualInterpretation = this.ImportIndividuals();
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
            this._store.ObjectDomain,
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
                        .filter(element => classExpression.has(element[1]))
                        .map(element => element[0])));
    }

    ObjectAllValuesFrom(
        objectAllValuesFrom: IObjectAllValuesFrom
        ): Observable<Set<any>>
    {
        const groupedByDomain = combineLatest(
            this._store.ObjectDomain,
            this.ObservePropertyExpression(objectAllValuesFrom.ObjectPropertyExpression),
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    element => element[0]));

        return combineLatest(
            groupedByDomain,
            objectAllValuesFrom.ClassExpression.Select(this),
            (groupedByDomain, classExpression) =>
                new Set<any>(
                    [...groupedByDomain.entries()]
                        .filter(entry => entry[1].every(element => classExpression.has(element[1])))
                        .map(entry => entry[0])));
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): Observable<Set<any>>
    {
        const individual = this.InterpretIndividual(objectHasValue.Individual);
        return this.ObservePropertyExpression(objectHasValue.ObjectPropertyExpression).pipe(
            map(objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(element => element[1] === individual)
                    .map(element => element[0]))));
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): Observable<Set<any>>
    {
        return this.ObservePropertyExpression(objectHasSelf.ObjectPropertyExpression).pipe(
            map(objectPropertyExpression =>
                new Set<any>(objectPropertyExpression
                    .filter(element => element[0] === element[1])
                    .map(element => element[0]))));
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): Observable<Set<any>>
    {
        if(objectMinCardinality.Cardinality === 0)
            return this._store.ObjectDomain;

        let observableObjectPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(objectMinCardinality.ObjectPropertyExpression);
        if(objectMinCardinality.ClassExpression)
            observableObjectPropertyExpression = combineLatest(
                observableObjectPropertyExpression,
                objectMinCardinality.ClassExpression.Select(this),
                (objectPropertyExpression, classExpression) =>
                    objectPropertyExpression.filter(element => classExpression.has(element[1])));

        if(objectMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return observableObjectPropertyExpression.pipe(
                map(objectPropertyExpression => new Set<any>(objectPropertyExpression.map(element => element[0]))));

        return observableObjectPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length >= objectMinCardinality.Cardinality)
                    .map(entry => entry[0]))));
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
                    objectPropertyExpression.filter(element => classExpression.has(element[1])));

        return combineLatest(
            this._store.ObjectDomain,
            observableObjectPropertyExpression,
            (objectDomain, objectPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    objectPropertyExpression,
                    individual => individual,
                    element => element[0])).pipe(
                        map(groupedByDomain =>
                            new Set<any>([...groupedByDomain.entries()]
                                .filter(entry => entry[1].length <= objectMaxCardinality.Cardinality)
                                .map(entry => entry[0]))));
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
                    objectPropertyExpression.filter(element => classExpression.has(element[1])));

        if(objectExactCardinality.Cardinality === 0)
            return combineLatest(
                this._store.ObjectDomain,
                observableObjectPropertyExpression,
                (objectDomain, objectPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        objectPropertyExpression,
                        individual => individual,
                        element => element[0])).pipe(
                            map(groupedByDomain =>
                                new Set<any>([...groupedByDomain.entries()]
                                    .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                                    .map(entry => entry[0]))));

        return observableObjectPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length === objectExactCardinality.Cardinality)
                    .map(entry => entry[0]))));
    }

    DataSomeValuesFrom(
        dataSomeValuesFrom: IDataSomeValuesFrom
        ): Observable<Set<any>>
    {
        return this.ObservePropertyExpression(dataSomeValuesFrom.DataPropertyExpression).pipe(
            map(dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(element => dataSomeValuesFrom.DataRange.HasMember(element[1]))
                    .map(element => element[0]))));
    }

    DataAllValuesFrom(
        dataAllValuesFrom: IDataAllValuesFrom
        ): Observable<Set<any>>
    {
        return this.ObservePropertyExpression(dataAllValuesFrom.DataPropertyExpression).pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>(
                    [...groupedByDomain.entries()]
                        .filter(entry => entry[1].every(value => dataAllValuesFrom.DataRange.HasMember(value)))
                        .map(entry => entry[0]))));
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): Observable<Set<any>>
    {
        return this.ObservePropertyExpression(dataHasValue.DataPropertyExpression).pipe(
            map(dataPropertyExpression =>
                new Set<any>(dataPropertyExpression
                    .filter(element => element[1] === dataHasValue.Value)
                    .map(element => element[0]))));
    }

    DataMinCardinality(
        dataMinCardinality: IDataMinCardinality
        ): Observable<Set<any>>
    {
        if(dataMinCardinality.Cardinality === 0)
            return this._store.ObjectDomain;

        let observableDataPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(dataMinCardinality.DataPropertyExpression);
        if(dataMinCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(element => dataMinCardinality.DataRange.HasMember(element[1]))));

        if(dataMinCardinality.Cardinality === 1)
            // Optimise for a minimum cardinality of 1.
            return observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => new Set<any>(dataPropertyExpression.map(element => element[0]))));

        return observableDataPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length >= dataMinCardinality.Cardinality)
                    .map(entry => entry[0]))));
    }

    DataMaxCardinality(
        dataMaxCardinality: IDataMaxCardinality
        ): Observable<Set<any>>
    {
        let observableDataPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(dataMaxCardinality.DataPropertyExpression);
        if(dataMaxCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(element => dataMaxCardinality.DataRange.HasMember(element[1]))));

        return combineLatest(
            this._store.ObjectDomain,
            observableDataPropertyExpression,
            (objectDomain, dataPropertyExpression) =>
                GroupJoin(
                    objectDomain,
                    dataPropertyExpression,
                    individual => individual,
                    element => element[0])).pipe(
                        map(groupedByDomain =>
                            new Set<any>([...groupedByDomain.entries()]
                                .filter(entry => entry[1].length <= dataMaxCardinality.Cardinality)
                                .map(entry => entry[0]))));
    }

    DataExactCardinality(
        dataExactCardinality: IDataExactCardinality
        ): Observable<Set<any>>
    {
        let observableDataPropertyExpression: Observable<[any, any][]> = this.ObservePropertyExpression(dataExactCardinality.DataPropertyExpression);
        if(dataExactCardinality.DataRange)
            observableDataPropertyExpression = observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => dataPropertyExpression.filter(element => dataExactCardinality.DataRange.HasMember(element[1]))));

        if(dataExactCardinality.Cardinality === 0)
            return combineLatest(
                this._store.ObjectDomain,
                observableDataPropertyExpression,
                (objectDomain, dataPropertyExpression) =>
                    GroupJoin(
                        objectDomain,
                        dataPropertyExpression,
                        individual => individual,
                        element => element[0])).pipe(
                            map(groupedByDomain =>
                                new Set<any>([...groupedByDomain.entries()]
                                    .filter(entry => entry[1].length === dataExactCardinality.Cardinality)
                                    .map(entry => entry[0]))));

        if(dataExactCardinality.Cardinality === 1 && this._functionalDataProperties.has(dataExactCardinality.DataPropertyExpression))
            // Optimise for Functional Data Properties.
            return observableDataPropertyExpression.pipe(
                map(dataPropertyExpression => new Set<any>(dataPropertyExpression.map(element => element[0]))));

        return observableDataPropertyExpression.pipe(
            map(this.GroupByDomain),
            map(groupedByDomain =>
                new Set<any>([...groupedByDomain.entries()]
                    .filter(entry => entry[1].length === dataExactCardinality.Cardinality)
                    .map(entry => entry[0]))));
    }

    private ObservePropertyExpression(
        propertyExpression: IPropertyExpression
        ): Observable<[any, any][]>
    {
        return this._store.ObserveProperty(propertyExpression.LocalName);
    }

    private ImportIndividuals(): Map<IIndividual, any>
    {
        const individualInterpretation = new Map<IIndividual, any>();
        for(const namedIndividual of this._ontology.Get(this._ontology.IsAxiom.INamedIndividual))
        {
            const object = {};
            for(const dataPropertyAssertion of this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion))
                if(dataPropertyAssertion.SourceIndividual === namedIndividual)
                {
                    const propertyName = dataPropertyAssertion.DataPropertyExpression.LocalName;
                    if(typeof object[propertyName] === 'undefined' &&
                        !this._functionalDataProperties.has(dataPropertyAssertion.DataPropertyExpression))
                        object[propertyName] = [];

                    if(object[propertyName] instanceof Array)
                        object[propertyName].push(dataPropertyAssertion.TargetValue);

                    else
                        object[propertyName] = dataPropertyAssertion.TargetValue;
                }

            individualInterpretation.set(
                namedIndividual,
                this._store.Import(object));
        }

        return individualInterpretation;
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
