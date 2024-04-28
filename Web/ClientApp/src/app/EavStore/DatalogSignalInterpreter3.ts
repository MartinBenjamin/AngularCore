import { Compare } from "../Collections/SortedSet";
import { WrapperType } from "../Ontology/Wrapped";
import { Signal } from "../Signal/Signal";
import { DatalogInterpreter } from "./DatalogInterpreter";
import { Fact, IEavStore } from "./IEavStore";
import { Tuple } from "./Tuple";

type SignalParams<P> = {[Parameter in keyof P]: Signal<P[Parameter]>;};

export class DatalogSignalInterpreter extends DatalogInterpreter<WrapperType.Signal>
{
    constructor(
        private readonly _eavStore: IEavStore,
        tupleCompare              : Compare<Tuple>
        )
    {
        super(tupleCompare);
    }

    Wrap<TIn extends any[], TOut>(
        map: (...params: TIn) => TOut,
        ...params: SignalParams<TIn>
        ): Signal<TOut>
    {
        return this._eavStore.SignalScheduler.AddSignal(
            map,
            params);
    }

    WrapEdb(
        atom: Fact
        ): Signal<Iterable<Fact>>
    {
        return this._eavStore.Signal(atom);
    }
}
