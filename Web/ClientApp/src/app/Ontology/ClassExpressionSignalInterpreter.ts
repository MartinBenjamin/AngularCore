import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { ClassExpressionInterpreter, ICache } from './ClassExpressionInterpreter';
import { IClass } from './IClass';
import { IOntology } from './IOntology';
import { IProperty } from './IProperty';
import { PropertyExpressionInterpreter } from './PropertyExpressionInterpreter';
import { WrapperType } from './Wrapped';

type SignalParams<P> = { [Parameter in keyof P]: Signal<P[Parameter]>; };

class SignalCache implements ICache<WrapperType.Signal>
{
    private readonly _signals = new Map();

    set(
        key,
        wrapped
        ): void
    {
        this._signals.set(
            key,
            wrapped);
        wrapped.AddRemoveAction(() => this._signals.delete(key));
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
        store: IEavStore,
        cache: ICache<WrapperType.Signal> = new SignalCache()
        )
    {
        super(
            <TIn extends any[], TOut>(
                map: (...params: TIn) => TOut,
                ...params: SignalParams<TIn>
            ): Signal<TOut> => store.SignalScheduler.AddSignal(
                map,
                params),
            new PropertyExpressionSignalInterpreter(
                store,
                cache),
            ontology,
            store,
            cache);
    }

    protected WrapObjectDomain(): Signal<Set<any>>
    {
        return this._store.SignalEntities();
    }
}

export class PropertyExpressionSignalInterpreter extends PropertyExpressionInterpreter<WrapperType.Signal>
{
    constructor(
        private _store: IEavStore,
        private _propertyExpressionInterpretation: ICache<WrapperType.Signal> = new SignalCache()
        )
    {
        super(<TIn extends any[], TOut>(
            map: (...params: TIn) => TOut,
            ...params: SignalParams<TIn>
        ): Signal<TOut> => _store.SignalScheduler.AddSignal(
            map,
            params))
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
        }

        return interpretation;
    }
}
