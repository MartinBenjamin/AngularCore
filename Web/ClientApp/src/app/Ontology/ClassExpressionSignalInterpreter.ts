import { Signal } from '../Signal';
import { ClassExpressionInterpreter, IEavStore, Wrapped } from './ClassExpressionInterpreter';
import { IOntology } from './IOntology';
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';

type SignalParams<P> = { [Parameter in keyof P]: Signal<P[Parameter]>; };

export class ClassExpressionSignalInterpreter extends ClassExpressionInterpreter<Signal<Set<any>>, Signal<[any, any][]>>
{
    protected Wrap<P extends any[], R>(
        map: (...params: P) => R,
        ...params: { [Parameter in keyof P]: Wrapped<P[Parameter]>; }
        ): Signal<R>
    {
        return this._store.SignalScheduler.AddSignal(
            map,
            <SignalParams<P>>params);
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
            store.SignalEntities);
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
