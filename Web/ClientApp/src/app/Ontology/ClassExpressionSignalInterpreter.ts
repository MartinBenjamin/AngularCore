import { Signal } from '../Signal';
import { ClassExpressionInterpreter, ICache, IEavStore } from './ClassExpressionInterpreter';
import { IClass } from './IClass';
import { IOntology } from './IOntology';
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { WrapperType } from './Wrapped';

type SignalParams<P> = { [Parameter in keyof P]: Signal<P[Parameter]>; };

class SignalCache implements ICache<WrapperType.Signal>
{
    private readonly _signals = new Map<IClass, Signal<Set<any>>>();

    Set(
        class$: IClass,
        wrapped: Signal<Set<any>>
        ): void
    {
        this._signals.set(
            class$,
            wrapped);
        wrapped.AddRemoveAction(() => this._signals.delete(class$));
    }

    Get(
        class$: IClass
        ): Signal<Set<any>>
    {
        return this._signals.get(class$);
    }
}

export class ClassExpressionSignalInterpreter extends ClassExpressionInterpreter<WrapperType.Signal>
{
    protected Wrap<TIn extends any[], TOut>(
        map: (...params: TIn) => TOut,
        ...params: SignalParams<TIn>
        ): Signal<TOut>
    {
        return this._store.SignalScheduler.AddSignal(
            map,
            params);
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
            new SignalCache());
    }

    protected WrapObjectDomain(): Signal<Set<any>>
    {
        return this._store.SignalEntities();
    }
}

export class PropertyExpressionObservableGenerator implements IPropertyExpressionSelector<Signal<[any, any][]>>
{
    private _propertyExpressionInterpretation = new Map<IPropertyExpression, Signal<[any, any][]>>();

    constructor(
        private _store: IEavStore
        )
    {
    }   

    PropertyExpression(
        propertyExpression: IPropertyExpression
        ): Signal<[any, any][]>
    {
        let interpretation = this._propertyExpressionInterpretation.get(propertyExpression);

        if(!interpretation)
        {
            interpretation = this._store.Signal(propertyExpression.LocalName);
            this._propertyExpressionInterpretation.set(
                propertyExpression,
                interpretation);
            interpretation.AddRemoveAction(() => this._propertyExpressionInterpretation.delete(propertyExpression));
        }

        return interpretation;
    }

    ObjectPropertyExpression(
        objectPropertyExpression: IObjectPropertyExpression
        ): Signal<[any, any][]>
    {
        return this.PropertyExpression(objectPropertyExpression);
    }

    DataPropertyExpression(
        dataPropertyExpression: IDataPropertyExpression
        ): Signal<[any, any][]>
    {
        return this.PropertyExpression(dataPropertyExpression);
    }
}
