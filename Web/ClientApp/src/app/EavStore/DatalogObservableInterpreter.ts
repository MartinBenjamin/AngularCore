import { Observable } from 'rxjs';
import { Subscriber } from '../../../node_modules/rxjs/index';
import { WrapperType } from "../Ontology/Wrapped";
import { IScheduler, Signal } from '../Signal/Signal';
import { Atom, Rule } from './Datalog';
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { IEavStore } from './IEavStore';
import { Tuple } from "./Tuple";

export class DatalogObservableInterpreter implements IDatalogInterpreter<WrapperType.Observable>
{
    constructor(
        private readonly _signalScheduler: IScheduler,
        private readonly _datalogInterpreter: IDatalogInterpreter<WrapperType.Signal>
        )
    {
    }

    Query<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]
        ): Observable<{ [K in keyof T]: any; }[]>
    {
        const subscribers = new Set<Subscriber<{ [K in keyof T]: any; }[]>>();
        let signal: Signal<void>;
        let querySignal: Signal<{[K in keyof T]: any;}[]>
        return new Observable<{[K in keyof T]: any;}[]>(
            (subscriber: Subscriber<{[K in keyof T]: any;}[]>) =>
            {
                subscribers.add(subscriber);
                if(!signal)
                {
                    querySignal = this._datalogInterpreter.Query(
                        head,
                        body,
                        ...rules);
                    signal = this._signalScheduler.AddSignal(
                        result => subscriber.next(result),
                        [querySignal]);
                    subscriber.next(this._signalScheduler.Sample(querySignal));
                }

                subscriber.add(
                    () =>
                    {
                        subscribers.delete(subscriber);
                        if(!subscribers.size)
                        {
                            this._signalScheduler.RemoveSignal(signal);
                            signal = null;
                            querySignal = null;
                        }
                    });
            });
    }

    Rules(
        rules: Rule[]
        ): Map<string, Observable<Iterable<Tuple>>>
    {
        return new Map([...this._datalogInterpreter.Rules(rules)].map(([predicateSymbol, signal]) =>
            [predicateSymbol, this._signalScheduler.Observe(signal)]));
    }
}
