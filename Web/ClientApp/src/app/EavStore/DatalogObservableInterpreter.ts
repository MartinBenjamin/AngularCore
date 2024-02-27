import { Observable } from 'rxjs';
import { WrapperType } from "../Ontology/Wrapped";
import { Atom, Rule } from './Datalog';
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { IEavStore } from './IEavStore';
import { Tuple } from "./Tuple";

export class DatalogObservableInterpreter implements IDatalogInterpreter<WrapperType.Observable>
{
    constructor(
        private readonly _eavStore: IEavStore
        )
    {
    }

    Query<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]
        ): Observable<{ [K in keyof T]: any; }[]>
    {
        return new Observable<{[K in keyof T]: any;}[]>(
            subscriber =>
            {
                const signal = this._eavStore.SignalScheduler.AddSignal(
                    result => subscriber.next(result),
                    [this._eavStore.Signal<T>(head, body, ...rules)]);

                subscriber.add(() => this._eavStore.SignalScheduler.RemoveSignal(signal));
            });
    }
}
