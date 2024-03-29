import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { AtomInterpreter } from './AtomInterpreter';
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
                ontology,
                store,
                cache),
            ontology,
            store,
            cache);

        new AtomInterpreter<WrapperType.Signal>(
            <TIn extends any[], TOut>(
                map: (...params: TIn) => TOut,
                ...params: SignalParams<TIn>
            ): Signal<TOut> => store.SignalScheduler.AddSignal(
                map,
                params),
            this.PropertyExpressionInterpreter,
            this);
    }

    protected WrapObjectDomain(): Signal<Set<any>>
    {
        return this._store.SignalEntities();
    }
}

export class PropertyExpressionSignalInterpreter extends PropertyExpressionInterpreter<WrapperType.Signal>
{
    constructor(
        ontology: IOntology,
        private _store: IEavStore,
        propertyInterpretation: ICache<WrapperType.Signal> = new SignalCache()
        )
    {
        super(
            <TIn extends any[], TOut>(
                map: (...params: TIn) => TOut,
                ...params: SignalParams<TIn>
            ): Signal<TOut> => _store.SignalScheduler.AddSignal(
                map,
                params),
            ontology,
            propertyInterpretation);
    }   

    Input(
        property: IProperty
        ): Signal<[any, any][]>
    {
        return this._store.Signal(property.LocalName);
    }
}
