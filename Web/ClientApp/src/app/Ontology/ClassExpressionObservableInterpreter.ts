import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { IEavStore } from "../EavStore/IEavStore";
import { AtomInterpreter } from "./AtomInterpreter";
import { ClassExpressionInterpreter, ICache } from "./ClassExpressionInterpreter";
import { IOntology } from "./IOntology";
import { IProperty } from "./IProperty";
import { PropertyExpressionInterpreter } from "./PropertyExpressionInterpreter";
import { Wrap, WrapperType } from './Wrapped';

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };

const wrap: Wrap<WrapperType.Observable> = <TIn extends any[], TOut>(
    map: (...params: TIn) => TOut,
    ...params: ObservableParams<TIn>
    ): Observable<TOut> => !params.length ? new BehaviorSubject(map(...<TIn>[])) : combineLatest(
    params,
    map);

export class ClassExpressionObservableInterpreter extends ClassExpressionInterpreter<WrapperType.Observable>
{
    constructor(
        ontology: IOntology,
        store: IEavStore,
        cache: ICache<WrapperType.Observable> = new Map()
        )
    {
        super(
            wrap,
            new PropertyExpressionObservableInterpreter(
                ontology,
                store,
                cache),
            ontology,
            store,
            cache);

        new AtomInterpreter<WrapperType.Observable>(
            wrap,
            this.PropertyExpressionInterpreter,
            this);
    }

    protected WrapObjectDomain(): Observable<Set<any>>
    {
        return this._store.ObserveEntities();
    }
}

export class PropertyExpressionObservableInterpreter extends PropertyExpressionInterpreter<WrapperType.Observable>
{
    constructor(
        ontology: IOntology,
        private _store: IEavStore,
        propertyInterpretation: ICache<WrapperType.Observable> = new Map()
        )
    {
        super(
            wrap,
            ontology,
            propertyInterpretation);
    }   

    Input(
        property: IProperty
        ): Observable<[any, any][]>
    {
        return this._store.Observe(property.LocalName);
    }
}
