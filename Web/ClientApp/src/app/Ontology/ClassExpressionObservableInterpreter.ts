import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { ClassExpressionInterpreter, IEavStore, Wrapped } from "./ClassExpressionInterpreter";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };

export class ClassExpressionObservableInterpreter extends ClassExpressionInterpreter<Observable<Set<any>>, Observable<[any, any][]>>
{
    protected Wrap<P extends any[], R>(
        map: (...params: P) => R,
        ...params: { [Parameter in keyof P]: Wrapped<P[Parameter]>; }
        ): Observable<R>
    {
        const observableParams = <ObservableParams<P>>params;
        if(!observableParams.length)
            return new BehaviorSubject<R>(map(...<P>(<unknown>[])));

        else
            return combineLatest(
                observableParams,
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
    constructor(
        private _store: IEavStore
        )
    {
    }

    ObjectPropertyExpression(
        objectPropertyExpression: IObjectPropertyExpression
        ): Observable<[any, any][]>
    {
        return this._store.ObserveAttribute(objectPropertyExpression.LocalName);
    }

    DataPropertyExpression(
        dataPropertyExpression: IDataPropertyExpression
        ): Observable<[any, any][]>
    {
        return this._store.ObserveAttribute(dataPropertyExpression.LocalName);
    }
}
