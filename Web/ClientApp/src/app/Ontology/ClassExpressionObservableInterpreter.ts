import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { ClassExpressionInterpreter, ICache, IEavStore, Wrapped } from "./ClassExpressionInterpreter";
import { IClass } from "./IClass";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };

class ObservableCache implements ICache<Observable<Set<any>>>
{
    private readonly _observables = new Map<IClass, Observable<Set<any>>>();

    Set(
        class$: IClass,
        wrapped: Observable<Set<any>>
        ): void
    {
        this._observables.set(
            class$,
            wrapped);
    }

    Get(
        class$: IClass
        ): Observable<Set<any>>
    {
        return this._observables.get(class$);
    }
}

export class ClassExpressionObservableInterpreter extends ClassExpressionInterpreter<Observable<Set<any>>, Observable<[any, any][]>>
{
    protected Wrap<TIn extends any[], TOut>(
        map: (...params: TIn) => TOut,
        ...params: ObservableParams<TIn>
        ): Observable<TOut>
    {
        if(!params.length)
            return new BehaviorSubject(map(...<TIn>[]));

        else
            return combineLatest(
                params,
                map);
    }

    constructor(
        ontology: IOntology,
        store: IEavStore
        )
    {
        super(
            new PropertyExpressionObservableGenerator(store),
            ontology,
            store,
            new ObservableCache());
    }

    protected WrapObjectDomain(): Wrapped<Set<any>>
    {
        return this._store.ObserveEntities();
    }
}

export class PropertyExpressionObservableGenerator implements IPropertyExpressionSelector<Observable<[any, any][]>>
{
    private _propertyExpressionInterpretation = new Map<IPropertyExpression, Observable<[any, any][]>>();

    constructor(
        private _store: IEavStore
        )
    {
    }   

    PropertyExpression(
        propertyExpression: IPropertyExpression
        ): Observable<[any, any][]>
    {
        let interpretation = this._propertyExpressionInterpretation.get(propertyExpression);

        if(!interpretation)
        {
            interpretation = this._store.Observe(propertyExpression.LocalName);
            this._propertyExpressionInterpretation.set(
                propertyExpression,
                interpretation);
        }

        return interpretation;
    }

    ObjectPropertyExpression(
        objectPropertyExpression: IObjectPropertyExpression
        ): Observable<[any, any][]>
    {
        return this.PropertyExpression(objectPropertyExpression);
    }

    DataPropertyExpression(
        dataPropertyExpression: IDataPropertyExpression
        ): Observable<[any, any][]>
    {
        return this.PropertyExpression(dataPropertyExpression);
    }
}
