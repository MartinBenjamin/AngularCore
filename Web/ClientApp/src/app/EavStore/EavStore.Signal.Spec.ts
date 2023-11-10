import { } from 'jasmine';
import { assertBuilder } from '../assertBuilder';
import { ArraySet } from '../Collections/ArraySet';
import { SortedSet } from '../Collections/SortedSet';
import { Add } from './Atom';
import { EavStore, tupleCompare } from './EavStore';
import { Fact, IEavStore, Store } from './IEavStore';

describe(
    'EavStore.Signal(atom: Fact): Signal<Fact[]>',
    () =>
    {
        for(const atomEntityId of [undefined, 'e1', 'e2'])
            for(const atomAttribute of [undefined, 'a1', 'a2'])
                for(const atomValue of [undefined, 0, 1])
                {
                    describe(
                        `Given atom = [${ atomEntityId }, ${ atomAttribute }, ${ atomValue }]`,
                        () =>
                        {
                            for(const value of [0, 1])
                            {
                                let o: any = {};
                                describe(
                                    `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                                    () =>
                                    {
                                        const store: IEavStore = new EavStore();
                                        const entities = {
                                            e1: store.Assert(o),
                                            e2: store.Assert({})
                                        };

                                        describe(
                                            `Given trace: Set<Fact>[] and store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]):`,
                                            () =>
                                            {
                                                describe(
                                                    `Given e1.a1 = ${value}:`,
                                                    () =>
                                                    {
                                                        const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                        const fact: Fact = [entities.e1, 'a1', value];
                                                        const trace: Set<Fact>[] = [];
                                                        const signal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]);
                                                        entities.e1.a1 = value;
                                                        store.SignalScheduler.RemoveSignal(signal);

                                                        it(
                                                            `!trace[0].has([entities.e1, 'a1', ${value}])`,
                                                            () => expect(trace[0].has(fact)).toBe(false));

                                                        if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                           (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                           (atom[2] === undefined || atom[2] === value      ))
                                                        {
                                                            it(
                                                                `trace.length === 2`,
                                                                () => expect(trace.length).toBe(2));

                                                            it(
                                                                `trace[1].has([e1, 'a1', ${value}])`,
                                                                () => expect(trace[1].has(fact)).toBe(true));
                                                        }
                                                        else
                                                            it(
                                                                `trace.length === 1`,
                                                                () => expect(trace.length).toBe(1));

                                                    });
                                            });
                                    });
                            }
                        });
                }

        for(const atomEntityId of [undefined, 'e1', 'e2'])
            for(const atomAttribute of [undefined, 'a1', 'a2'])
                for(const atomValue of [undefined, 0, 1])
                {
                    describe(
                        `Given atom = [${atomEntityId}, ${atomAttribute}, ${atomValue}]`,
                        () =>
                        {
                            for(const value of [0, 1])
                            {
                                let o: any = { a1: value };
                                describe(
                                    `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                                    () =>
                                    {
                                        const store: IEavStore = new EavStore();
                                        const entities = {
                                            e1: store.Assert(o),
                                            e2: store.Assert({})
                                        };

                                        describe(
                                            `Given trace: Set<Fact>[] and store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]):`,
                                            () =>
                                            {
                                                describe(
                                                    `Given e1.a1 = undefined:`,
                                                    () =>
                                                    {
                                                        const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                        const fact: Fact = [entities.e1, 'a1', value];
                                                        const trace: Set<Fact>[] = [];
                                                        const signal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]);
                                                        entities.e1.a1 = undefined;
                                                        store.SignalScheduler.RemoveSignal(signal);

                                                        if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                           (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                           (atom[2] === undefined || atom[2] === value      ))
                                                        {
                                                            it(
                                                                `trace.length === 2`,
                                                                () => expect(trace.length).toBe(2));

                                                            it(
                                                                `trace[0].has([e1, 'a1', ${value}])`,
                                                                () => expect(trace[0].has(fact)).toBe(true));

                                                            it(
                                                                `!trace[trace.length - 1].has([e1, 'a1', ${value}])`,
                                                                () => expect(trace[1].has(fact)).toBe(false));
                                                        }
                                                        else
                                                        {
                                                            it(
                                                                `trace.length === 1`,
                                                                () => expect(trace.length).toBe(1));

                                                            it(
                                                                `!trace[0].has([e1, 'a1', ${value}])`,
                                                                () => expect(trace[0].has(fact)).toBe(false));
                                                        }
                                                    });
                                            });
                                    });
                            }
                        });
                }

        for(const atomEntityId of [undefined, 'e1', 'e2'])
            for(const atomAttribute of [undefined, 'a1', 'a2'])
                for(const atomValue of [undefined, 0, 1])
                {
                    describe(
                        `Given atom = [${atomEntityId}, ${atomAttribute}, ${atomValue}]`,
                        () =>
                        {
                            const values = [0, 1];
                            for(const before of values)
                                for(const after of values)
                                    if(before != after)
                                    {
                                        let o: any = { a1: before };
                                        describe(
                                            `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                                            () =>
                                            {
                                                const store: IEavStore = new EavStore();
                                                const entities = {
                                                    e1: store.Assert(o),
                                                    e2: store.Assert({})
                                                };

                                                describe(
                                                    `Given trace: Set<Fact>[] and store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]):`,
                                                    () =>
                                                    {
                                                        describe(
                                                            `Given e1.a1 = ${after}:`,
                                                            () =>
                                                            {
                                                                const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                                const beforeFact: Fact = [entities.e1, 'a1', before];
                                                                const afterFact: Fact = [entities.e1, 'a1', after];
                                                                const trace: Set<Fact>[] = [];
                                                                const signal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]);
                                                                entities.e1.a1 = after;
                                                                store.SignalScheduler.RemoveSignal(signal);

                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === before     ))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `trace[0].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[0].has(beforeFact)).toBe(true));

                                                                    it(
                                                                        `!trace[1].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[1].has(beforeFact)).toBe(false));
                                                                }
                                                                else
                                                                    it(
                                                                        `!trace[0].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[0].has(beforeFact)).toBe(false));

                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === after      ))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `trace[1].has([e1, 'a1', ${after}])`,
                                                                        () => expect(trace[1].has(afterFact)).toBe(true));
                                                                }
                                                                else if(trace[0].has(beforeFact))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `!trace[1].has([e1, 'a1', ${after}])`,
                                                                        () => expect(trace[1].has(afterFact)).toBe(false));
                                                                }
                                                            });
                                                    });
                                            });
                                    }
                        });
                }

        for(const method of ['push', 'unshift'])
            for(const atomEntityId of [undefined, 'e1', 'e2'])
                for(const atomAttribute of [undefined, 'a1', 'a2'])
                    for(const atomValue of [undefined, 0, 1])
                    {
                        describe(
                            `Given atom = [${atomEntityId}, ${atomAttribute}, ${atomValue}]`,
                            () =>
                            {
                                for(const value of [0, 1])
                                {
                                    let o: any = { a1: [] };
                                    describe(
                                        `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                                        () =>
                                        {
                                            const store: IEavStore = new EavStore();
                                            const entities = {
                                                e1: store.Assert(o),
                                                e2: store.Assert({})
                                            };

                                            describe(
                                                `Given trace: Set<Fact>[] and store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]):`,
                                                () =>
                                                {
                                                    describe(
                                                        `Given e1.a1.${method}(${value}):`,
                                                        () =>
                                                        {
                                                            const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                            const fact: Fact = [entities.e1, 'a1', value];
                                                            const trace: Set<Fact>[] = [];
                                                            const signal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]);
                                                            entities.e1.a1[method](value);
                                                            store.SignalScheduler.RemoveSignal(signal);

                                                            it(
                                                                `!trace[0].has([entities.e1, 'a1', ${value}])`,
                                                                () => expect(trace[0].has(fact)).toBe(false));

                                                            if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                               (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                               (atom[2] === undefined || atom[2] === value      ))
                                                            {
                                                                it(
                                                                    `trace.length === 2`,
                                                                    () => expect(trace.length).toBe(2));

                                                                it(
                                                                    `trace[1].has([e1, 'a1', ${value}])`,
                                                                    () => expect(trace[1].has(fact)).toBe(true));
                                                            }
                                                            else
                                                                it(
                                                                    `trace.length === 1`,
                                                                    () => expect(trace.length).toBe(1));
                                                        });
                                                });
                                        });
                                }
                            });
                    }

        for(const method of ['pop', 'shift'])
            for(const atomEntityId of [undefined, 'e1', 'e2'])
                for(const atomAttribute of [undefined, 'a1', 'a2'])
                    for(const atomValue of [undefined, 0, 1])
                    {
                        describe(
                            `Given atom = [${atomEntityId}, ${atomAttribute}, ${atomValue}]`,
                            () =>
                            {
                                for(const value of [0, 1])
                                {
                                    let o: any = { a1: [value] };
                                    describe(
                                        `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                                        () =>
                                        {
                                            const store: IEavStore = new EavStore();
                                            const entities = {
                                                e1: store.Assert(o),
                                                e2: store.Assert({})
                                            };

                                            describe(
                                                `Given trace: Set<Fact>[] and store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]):`,
                                                () =>
                                                {
                                                    describe(
                                                        `Given e1.a1.${method}():`,
                                                        () =>
                                                        {
                                                            const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                            const fact: Fact = [entities.e1, 'a1', value];
                                                            const trace: Set<Fact>[] = [];
                                                            const signal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]);
                                                            entities.e1.a1[method]();
                                                            store.SignalScheduler.RemoveSignal(signal);

                                                            if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                               (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                               (atom[2] === undefined || atom[2] === value      ))
                                                            {
                                                                it(
                                                                    `trace.length === 2`,
                                                                    () => expect(trace.length).toBe(2));

                                                                it(
                                                                    `trace[0].has([e1, 'a1', ${value}])`,
                                                                    () => expect(trace[0].has(fact)).toBe(true));

                                                                it(
                                                                    `!trace[1].has([e1, 'a1', ${value}])`,
                                                                    () => expect(trace[1].has(fact)).toBe(false));
                                                            }
                                                            else
                                                            {
                                                                it(
                                                                    `trace.length === 1`,
                                                                    () => expect(trace.length).toBe(1));

                                                                it(
                                                                    `!trace[0].has([e1, 'a1', ${value}])`,
                                                                    () => expect(trace[0].has(fact)).toBe(false));
                                                            }
                                                        });
                                                });
                                        });
                                }
                            });
                    }

        for(const atomEntityId of [undefined, 'e1', 'e2'])
            for(const atomAttribute of [undefined, 'a1', 'a2'])
                for(const atomValue of [undefined, 0, 1])
                {
                    describe(
                        `Given atom = [${atomEntityId}, ${atomAttribute}, ${atomValue}]`,
                        () =>
                        {
                            const values = [0, 1];
                            for(const before of values)
                                for(const after of values)
                                    if(before != after)
                                    {
                                        let o: any = { a1: [before] };
                                        describe(
                                            `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                                            () =>
                                            {
                                                const store: IEavStore = new EavStore();
                                                const entities = {
                                                    e1: store.Assert(o),
                                                    e2: store.Assert({})
                                                };

                                                describe(
                                                    `Given trace: Set<Fact>[] and store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]):`,
                                                    () =>
                                                    {
                                                        describe(
                                                            `Given e1.a1.splice(o, 1, ${after}):`,
                                                            () =>
                                                            {
                                                                const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                                const beforeFact: Fact = [entities.e1, 'a1', before];
                                                                const afterFact: Fact = [entities.e1, 'a1', after];
                                                                const trace: Set<Fact>[] = [];
                                                                const signal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]);
                                                                entities.e1.a1.splice(o, 1, after);
                                                                store.SignalScheduler.RemoveSignal(signal);

                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === before     ))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `trace[0].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[0].has(beforeFact)).toBe(true));

                                                                    it(
                                                                        `!trace[1].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[1].has(beforeFact)).toBe(false));
                                                                }
                                                                else
                                                                    it(
                                                                        `!trace[0].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[0].has(beforeFact)).toBe(false));


                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === after      ))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `trace[1].has([e1, 'a1', ${after}])`,
                                                                        () => expect(trace[1].has(afterFact)).toBe(true));
                                                                }
                                                                else if(trace[0].has(beforeFact))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `!trace[1].has([e1, 'a1', ${after}])`,
                                                                        () => expect(trace[1].has(afterFact)).toBe(false));
                                                                }
                                                            });
                                                    });
                                            });
                                    }
                        });
                }

        for(const atomEntityId of [undefined, 'e1', 'e2'])
            for(const atomAttribute of [undefined, 'a1', 'a2'])
                for(const atomValue of [undefined, 0, 1])
                {
                    describe(
                        `Given atom = [${atomEntityId}, ${atomAttribute}, ${atomValue}]`,
                        () =>
                        {
                            const values = [0, 1];
                            for(const before of values)
                                for(const after of values)
                                    if(before != after)
                                    {
                                        let o: any = { a1: [before] };
                                        describe(
                                            `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                                            () =>
                                            {
                                                const store: IEavStore = new EavStore();
                                                const entities = {
                                                    e1: store.Assert(o),
                                                    e2: store.Assert({})
                                                };

                                                describe(
                                                    `Given trace: Set<Fact>[] and store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]):`,
                                                    () =>
                                                    {
                                                        describe(
                                                            `Given e1.a1[0] = ${after}:`,
                                                            () =>
                                                            {
                                                                const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                                const beforeFact: Fact = [entities.e1, 'a1', before];
                                                                const afterFact: Fact = [entities.e1, 'a1', after];
                                                                const trace: Set<Fact>[] = [];
                                                                const signal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [store.Signal(atom)]);
                                                                entities.e1.a1[0] = after;
                                                                store.SignalScheduler.RemoveSignal(signal);

                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === before     ))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `trace[0].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[0].has(beforeFact)).toBe(true));

                                                                    it(
                                                                        `trace[1].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[1].has(beforeFact)).toBe(false));
                                                                }
                                                                else
                                                                    it(
                                                                        `trace[0].has([e1, 'a1', ${before}])`,
                                                                        () => expect(trace[0].has(beforeFact)).toBe(false));


                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === after      ))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `trace[1].has([e1, 'a1', ${after}])`,
                                                                        () => expect(trace[1].has(afterFact)).toBe(true));
                                                                }
                                                                else if(trace[0].has(beforeFact))
                                                                {
                                                                    it(
                                                                        `trace.length === 2`,
                                                                        () => expect(trace.length).toBe(2));

                                                                    it(
                                                                        `!trace[1].has([e1, 'a1', ${after}])`,
                                                                        () => expect(trace[1].has(afterFact)).toBe(false));
                                                                }
                                                            });
                                                    });
                                            });
                                    }
                        });
                }
    });

describe(
    'Signal<T extends [any, ...any[]]>(head: T, body: Atom[], ...rules: Rule[]): Signal<{ [K in keyof T]: any; }[]>',
    () =>
    {
        const o = { a1: 1, a2: [{ a1: 2, a3: 3 }], a4: null, [Symbol.toPrimitive]: function() { } };
        describe(
            `Given store = new EavStore():`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o);

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal([1], []) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            [1],
                            []);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].has([1])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal([1, 'a'], []) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            [1, 'a'],
                            []);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert(`trace[0].has([1, 'a'])`);
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', '?result']], [['rule', 3], []], [['rule', 3], []]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: any[][][] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(['?result'], [['rule', '?result']], [['rule', 3], []], [['rule', 3], []]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(result), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].length === 1');
                        assert('trace[0][0].length === 1');
                        assert('trace[0][0][0] === 3');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', 1, '?result']], [['rule', 0, 3], []], [['rule', 1, 4], []]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(['?result'], [['rule', 1, '?result']], [['rule', 0, 3], []], [['rule', 1, 4], []]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([4])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', '?result']], [['rule', 1], []], [['rule', 2], []]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(['?result'], [['rule', '?result']], [['rule', 1], []], [['rule', 2], []]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 2');
                        assert('trace[0].has([1])');
                        assert('trace[0].has([2])');
                    });
            });

        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o);

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [[e, 'a1', '?result']]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'],
                            [[e, 'a1', '?result']]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].has([e.a1])');
                    });
            });

        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o);

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [[e, 'a1', '?a1'], Add('?a1', 100, '?result')]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'],
                            [[e, 'a1', '?a1'], Add('?a1', 100, '?result')]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].has([e.a1 + 100])');
                    });
            });

        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o);

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [[e, 'a2', '?a2'], ['?a2', 'a3', '?result']]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'],
                            [[e, 'a2', '?a2'], ['?a2', 'a3', '?result']]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].has([e.a2[0].a3])');
                    });
            });

        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o);

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', '?result']], [['rule', '?result'], [[e, 'a1', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', '?result']],
                            [['rule', '?result'], [[e, 'a1', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].has([e.a1])');
                    });
            });

        const o1 = { a1: [{ a2: 1, a3: 1 }, { a2: 2, a3: 1 }] };
        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o1)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o1);

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', , '?result']], [['rule', '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', , '?result']],
                            [['rule', '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 2');
                        assert('trace[0].has([e.a1[0].a2])');
                        assert('trace[0].has([e.a1[1].a2])');
                    });
            });

        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o1)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o1);

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', e.a1[0], '?result']], [['rule', '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', e.a1[0], '?result']],
                            [['rule', '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([e.a1[0].a2])');
                        assert('!trace[0].has([e.a1[1].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', e.a1[1], '?result']], [['rule', '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', e.a1[1], '?result']],
                            [['rule', '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('!trace[0].has([e.a1[0].a2])');
                        assert('trace[0].has([e.a1[1].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', e.a1[0], e.a1[1], '?result']], [['rule', '?a1', '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', e.a1[0], e.a1[1], '?result']],
                            [['rule', '?a1', '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 0');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', e.a1[0], e.a1[0], '?result']], [['rule', '?a1', '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', e.a1[0], e.a1[0], '?result']],
                            [['rule', '?a1', '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([e.a1[0].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?constant', '?result'], [['rule', '?constant', e.a1[0], '?result']], [['rule', 1, '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?constant', '?result'], [['rule', '?constant', e.a1[0], '?result']],
                            [['rule', 1, '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([1, e.a1[0].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?constant', '?result'], [['rule', '?constant', '?constant', e.a1[0], '?result']], [['rule', 1, 2, '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?constant', '?result'], [['rule', '?constant', '?constant', e.a1[0], '?result']],
                            [['rule', 1, 2, '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 0');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?constant', '?result'], [['rule', '?constant', '?constant', e.a1[0], '?result']], [['rule', 1, 1, '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?constant', '?result'], [['rule', '?constant', '?constant', e.a1[0], '?result']],
                            [['rule', 1, 1, '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([1, e.a1[0].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', 1, e.a1[0], '?result']], [['rule', 2, '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', 1, e.a1[0], '?result']],
                            [['rule', 2, '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 0');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', 1, e.a1[0], '?result']], [['rule', 1, '?a1', '?result'], [['?a1', 'a2', '?result']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', 1, e.a1[0], '?result']],
                            [['rule', 1, '?a1', '?result'], [['?a1', 'a2', '?result']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([e.a1[0].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?a2', '?a3'], [['rule', '?a2', '?a3']], [['rule', '?a2', '?a3'], [['?a1', 'a2', '?a2'], ['?a1', 'a3', '?a3' ]]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?a2', '?a3'], [['rule', '?a2', '?a3']],
                            [['rule', '?a2', '?a3'], [['?a1', 'a2', '?a2'], ['?a1', 'a3', '?a3']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 2');
                        assert('trace[0].has([e.a1[0].a2, e.a1[0].a3])');
                        assert('trace[0].has([e.a1[1].a2, e.a1[1].a3])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', '?result', '?result']], [['rule', '?a2', '?a3'], [['?a1', 'a2', '?a2'], ['?a1', 'a3', '?a3']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', '?result', '?result']],
                            [['rule', '?a2', '?a3'], [['?a1', 'a2', '?a2'], ['?a1', 'a3', '?a3']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([e.a1[0].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result1', '?result2'], [['rule', '?result1', '?result2']], [['rule', '?a2', '?a2'], [[e.a1[0], 'a2', '?a2']]]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result1', '?result2'], [['rule', '?result1', '?result2']],
                            [['rule', '?a2', '?a2'], [[e.a1[0], 'a2', '?a2']]]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([e.a1[0].a2, e.a1[0].a2])');
                    });

                describe(
                    `Given
trace: Set<any[]>[] and
signal = store.Signal(['?result'], [['rule', '?result']], [['rule', 1], []]) and
store.SignalScheduler.AddSignal(result => trace.push(result), [signal])`,
                    () =>
                    {
                        const trace: Set<any[]>[] = [];
                        const assert = assertBuilder('Store', 'store', 'e', 'trace')
                            (Store, store, e, trace);
                        const signal = store.Signal(
                            ['?result'], [['rule', '?result']],
                            [['rule', 1], []]);
                        const traceSignal = store.SignalScheduler.AddSignal(result => trace.push(new ArraySet(result)), [signal]);
                        store.SignalScheduler.RemoveSignal(traceSignal);
                        assert('trace.length === 1');
                        assert('trace[0].size === 1');
                        assert('trace[0].has([1])');
                    });
            });


        describe(
            `Linear Recursion (Naïve):
T(x, y) :- R(x, y),
T(x, y) :- R(x, z), T(z, y)`,
            () =>
            {
                const RValues = [
                    [
                        [1, 2],
                        [2, 1],
                        [2, 3],
                        [1, 4],
                        [3, 4],
                        [4, 5]
                    ],
                    [
                        [1, 2],
                        [2, 3]
                    ],
                    []
                ].map((element: [number, number][]) => new SortedSet<[number, number]>(
                    tupleCompare,
                    element));

                const TValues = [
                    [
                        [1, 2],
                        [2, 1],
                        [2, 3],
                        [1, 4],
                        [3, 4],
                        [4, 5],
                        [1, 1],
                        [2, 2],
                        [1, 3],
                        [2, 4],
                        [1, 5],
                        [3, 5],
                        [2, 5]
                    ],
                    [
                        [1, 2],
                        [2, 3],
                        [1, 3]
                    ],
                    []
                ].map((element: [number, number][]) => new SortedSet<[number, number]>(
                    tupleCompare,
                    element));

                for(let index = 0; index < RValues.length; ++index)
                    describe(
                        `Given R: ${JSON.stringify([...RValues[index]])}`,
                        () =>
                        {
                            const store: IEavStore = new EavStore();
                            const trace: Set<any[]>[] = [];

                            let vertexIds = new Set<number>();
                            for(const [source, destination] of RValues[index])
                            {
                                vertexIds.add(source);
                                vertexIds.add(destination);
                            }

                            let vertices = new Map([...vertexIds].map(vertexId => [vertexId, store.Assert({ Id: vertexId, R: [] })]));
                            for(const [source, destination] of RValues[index])
                                vertices.get(source).R.push(vertices.get(destination));

                            const signal = store.Signal(
                                ['?xId', '?yId'], [['T', '?x', '?y'], ['?x', 'Id', '?xId'], ['?y', 'Id', '?yId']],
                                [['T', '?x', '?y'], [['?x', 'R', '?y']]],
                                [['T', '?x', '?y'], [['?x', 'R', '?z'], ['T', '?z', '?y']]]);

                            store.SignalScheduler.AddSignal(
                                (result: [number, number][]) => trace.push(new SortedSet<[number, number]>(
                                    tupleCompare,
                                    result)),
                                [signal]);

                            it(
                                `The expected value of T is ${JSON.stringify([...TValues[index]])}`,
                                () => expect(JSON.stringify([...trace[0]])).toBe(JSON.stringify([...TValues[index]])));
                        });

                for(let index = 0; index < RValues.length; ++index)
                    describe(
                        `Given R: ${JSON.stringify([...RValues[index]])}`,
                        () =>
                        {
                            const store: IEavStore = new EavStore();
                            const trace: Set<any[]>[] = [];

                            let vertexIds = new Set<number>();
                            for(const [source, destination] of RValues[index])
                            {
                                vertexIds.add(source);
                                vertexIds.add(destination);
                            }

                            let vertices = new Map([...vertexIds].map(vertexId => [vertexId, store.Assert({ Id: vertexId, R: [] })]));
                            for(const [source, destination] of RValues[index])
                                vertices.get(source).R.push(vertices.get(destination));

                            const signal = store.Signal(
                                ['?xId', '?yId'], [['T', '?x', '?y'], ['?x', 'Id', '?xId'], ['?y', 'Id', '?yId']],
                                [['T', '?x', '?y'], [['?x', 'R', '?y']]],
                                [['T', '?x', '?z'], [['?x', 'R', '?y'], ['T', '?y', '?z']]]);

                            store.SignalScheduler.AddSignal(
                                (result: [number, number][]) => trace.push(new SortedSet<[number, number]>(
                                    tupleCompare,
                                    result)),
                                [signal]);

                            it(
                                `The expected value of T is ${JSON.stringify([...TValues[index]])}`,
                                () => expect(JSON.stringify([...trace[0]])).toBe(JSON.stringify([...TValues[index]])));
                        });

                for(let index = 0; index < RValues.length; ++index)
                    describe(
                        `Given R: ${JSON.stringify([...RValues[index]])}`,
                        () =>
                        {
                            const store: IEavStore = new EavStore();
                            const trace: Set<any[]>[] = [];

                            let vertexIds = new Set<number>();
                            for(const [source, destination] of RValues[index])
                            {
                                vertexIds.add(source);
                                vertexIds.add(destination);
                            }

                            let vertices = new Map([...vertexIds].map(vertexId => [vertexId, store.Assert({ Id: vertexId, R: [] })]));
                            for(const [source, destination] of RValues[index])
                                vertices.get(source).R.push(vertices.get(destination));

                            const signal = store.Signal(
                                ['?xId', '?yId'], [['T', '?x', '?y'], ['?x', 'Id', '?xId'], ['?y', 'Id', '?yId']],
                                [['T', '?x', '?y'], [['?x', 'R', '?y']]],
                                [['T', '?x', '?y'], [['T', '?x', '?z'], ['?z', 'R', '?y'], ]]);

                            store.SignalScheduler.AddSignal(
                                (result: [number, number][]) => trace.push(new SortedSet<[number, number]>(
                                    tupleCompare,
                                    result)),
                                [signal]);

                            it(
                                `The expected value of T is ${JSON.stringify([...TValues[index]])}`,
                                () => expect(JSON.stringify([...trace[0]])).toBe(JSON.stringify([...TValues[index]])));
                        });

                for(let index = 0; index < RValues.length; ++index)
                    describe(
                        `Given R: ${JSON.stringify([...RValues[index]])}`,
                        () =>
                        {
                            const store: IEavStore = new EavStore();
                            const trace: Set<any[]>[] = [];

                            let vertexIds = new Set<number>();
                            for(const [source, destination] of RValues[index])
                            {
                                vertexIds.add(source);
                                vertexIds.add(destination);
                            }

                            let vertices = new Map([...vertexIds].map(vertexId => [vertexId, store.Assert({ Id: vertexId, R: [] })]));
                            for(const [source, destination] of RValues[index])
                                vertices.get(source).R.push(vertices.get(destination));

                            const signal = store.Signal(
                                ['?xId', '?yId'], [['T', '?x', '?y'], ['?x', 'Id', '?xId'], ['?y', 'Id', '?yId']],
                                [['T', '?x', '?y'], [['?x', 'R', '?y']]],
                                [['T', '?x', '?z'], [['T', '?x', '?y'], ['?y', 'R', '?z'],]]);

                            store.SignalScheduler.AddSignal(
                                (result: [number, number][]) => trace.push(new SortedSet<[number, number]>(
                                    tupleCompare,
                                    result)),
                                [signal]);

                            it(
                                `The expected value of T is ${JSON.stringify([...TValues[index]])}`,
                                () => expect(JSON.stringify([...trace[0]])).toBe(JSON.stringify([...TValues[index]])));
                        });

                for(let index = 0; index < RValues.length; ++index)
                    describe(
                        `Given R: ${JSON.stringify([...RValues[index]])}`,
                        () =>
                        {
                            const store: IEavStore = new EavStore();
                            const trace: Set<any[]>[] = [];

                            let vertexIds = new Set<number>();
                            for(const [source, destination] of RValues[index])
                            {
                                vertexIds.add(source);
                                vertexIds.add(destination);
                            }

                            let vertices = new Map([...vertexIds].map(vertexId => [vertexId, store.Assert({ Id: vertexId, R: [] })]));
                            for(const [source, destination] of RValues[index])
                                vertices.get(source).R.push(vertices.get(destination));

                            const signal = store.Signal(
                                ['?xId', '?yId'], [['T', '?x', '?y'], ['?x', 'Id', '?xId'], ['?y', 'Id', '?yId']],
                                [['T', '?x', '?y'], [['?x', 'R', '?y']]],
                                [['T', '?x', '?y'], [['T', '?x', '?z'], ['T', '?z', '?y'],]]);

                            store.SignalScheduler.AddSignal(
                                (result: [number, number][]) => trace.push(new SortedSet<[number, number]>(
                                    tupleCompare,
                                    result)),
                                [signal]);

                            it(
                                `The expected value of T is ${JSON.stringify([...TValues[index]])}`,
                                () => expect(JSON.stringify([...trace[0]])).toBe(JSON.stringify([...TValues[index]])));
                        });
            });
    });
