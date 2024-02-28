import { } from 'jasmine';
import { assertBuilder } from '../assertBuilder';
import { ArraySet } from '../Collections/ArraySet';
import { Count } from './Aggregation';
import { EavStore } from './EavStore';
import { IEavStore, Store } from './IEavStore';


const o1 = {a1: [2, 3, 3, 4, 4, 4]};
describe(
    `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o1)}):`,
    () =>
    {
        const store: IEavStore = new EavStore();
        const e = store.Assert(o1);

        describe(
            `Given
trace: Set<any[]>[] and
signal = store.Signal(['?value', Count()], [[e, 'a1', '?value']]) and
store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal])`,
            () =>
            {
                const trace: Set<any[]>[] = [];
                const assert = assertBuilder('Store', 'store', 'e', 'trace', 'Count')
                    (Store, store, e, trace, Count);
                const signal = store.Signal(['?value', Count()], [[e, 'a1', '?value']]);
                const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                store.SignalScheduler.RemoveSignal(traceSignal);
                assert('trace.length === 1');
                assert('trace[0].size === 3');
                assert('trace[0].has([2, 1])');
                assert('trace[0].has([3, 2])');
                assert('trace[0].has([4, 3])');
            });
    });
