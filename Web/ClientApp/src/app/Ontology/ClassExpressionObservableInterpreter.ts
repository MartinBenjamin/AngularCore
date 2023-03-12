import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { ClassExpressionInterpreter, ICache, IEavStore } from "./ClassExpressionInterpreter";
import { IClass } from "./IClass";
import { IOntology } from "./IOntology";
import { IDataProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { WrapperType } from './Wrapped';

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };

class ObservableCache implements ICache<WrapperType.Observable>
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

export class ClassExpressionObservableInterpreter extends ClassExpressionInterpreter<WrapperType.Observable>
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

    protected WrapObjectDomain(): Observable<Set<any>>
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

    Property(
        property: IProperty
        ): Observable<[any, any][]>
    {
        let interpretation = this._propertyExpressionInterpretation.get(property);

        if(!interpretation)
        {
            interpretation = this._store.Observe(property.LocalName);
            this._propertyExpressionInterpretation.set(
                property,
                interpretation);
        }

        return interpretation;
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Observable<[any, any][]>
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Observable<[any, any][]>
    {
        return this.Property(dataProperty);
    }
}
