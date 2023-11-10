import { Signal } from '../Signal/Signal';
import { ClassExpressionInterpreter, ICache, IEavStore } from './ClassExpressionInterpreter';
import { IClass } from './IClass';
import { IOntology } from './IOntology';
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from './IProperty';
import { IPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { WrapperType } from './Wrapped';

type SignalParams<P> = { [Parameter in keyof P]: Signal<P[Parameter]>; };

class SignalCache implements ICache<WrapperType.Signal>
{
    private readonly _signals = new Map<IClass, Signal<Set<any>>>();

    set(
        class$: IClass,
        wrapped: Signal<Set<any>>
        ): void
    {
        this._signals.set(
            class$,
            wrapped);
        wrapped.AddRemoveAction(() => this._signals.delete(class$));
    }

    get(
        class$: IClass
        ): Signal<Set<any>>
    {
        return this._signals.get(class$);
    }
}

export class ClassExpressionSignalInterpreter extends ClassExpressionInterpreter<WrapperType.Signal>
{
    constructor(
        ontology: IOntology,
        store: IEavStore
        )
    {
        super(
            <TIn extends any[], TOut>(
                map: (...params: TIn) => TOut,
                ...params: SignalParams<TIn>
                ): Signal<TOut> => store.SignalScheduler.AddSignal(
                    map,
                    params),
            new PropertyExpressionSignalInterpreter(store),
            ontology,
            store,
            new SignalCache());
    }

    protected WrapObjectDomain(): Signal<Set<any>>
    {
        return this._store.SignalEntities();
    }
}

export class PropertyExpressionSignalInterpreter implements IPropertyExpressionSelector<Signal<[any, any][]>>
{
    private _propertyExpressionInterpretation = new Map<IPropertyExpression, Signal<[any, any][]>>();

    constructor(
        private _store: IEavStore
        )
    {
    }   

    Property(
        property: IProperty
        ): Signal<[any, any][]>
    {
        let interpretation = this._propertyExpressionInterpretation.get(property);

        if(!interpretation)
        {
            interpretation = this._store.Signal(property.LocalName);
            this._propertyExpressionInterpretation.set(
                property,
                interpretation);
            interpretation.AddRemoveAction(() => this._propertyExpressionInterpretation.delete(property));
        }

        return interpretation;
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Signal<[any, any][]>
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Signal<[any, any][]>
    {
        return this.Property(dataProperty);
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Signal<[any, any][]>
    {
        throw new Error("Method not implemented.");
    }
}
