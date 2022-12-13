import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { ClassExpressionInterpreter, IEavStore, Wrapped } from "./ClassExpressionInterpreter";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };

export class ClassExpressionObservableInterpreter extends ClassExpressionInterpreter<Observable<Set<any>>, Observable<[any, any][]>>
{
    protected Wrap<TIn extends any[], TOut>(
        map: (...params: TIn) => TOut,
        ...params: ObservableParams<TIn>
        ): Observable<TOut>
    {
        if(!params.length)
            return new BehaviorSubject<TOut>(map(...<TIn>[]));

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
            store.ObserveEntities());
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
