import { } from 'jasmine';
import { ArraySet } from '../Collections/ArraySet';
import { EavStore } from './EavStore';
import { Fact, IEavStore } from './IEavStore';

describe(
    'EavStore.Observe(atom: Fact): Observable<Fact[]>',
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
                                            `Given trace: Set<Fact>[] and store.Observe(atom).subscribe(result => trace.push(new ArraySet(result))):`,
                                            () =>
                                            {
                                                describe(
                                                    `Given e1.a1 = ${value}:`,
                                                    () =>
                                                    {
                                                        const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                        const fact: Fact = [entities.e1, 'a1', value];
                                                        const trace: Set<Fact>[] = [];
                                                        const subscription = store.Observe(atom).subscribe(result => trace.push(new ArraySet(result)));
                                                        entities.e1.a1 = value;
                                                        subscription.unsubscribe();

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
                                            `Given trace: Set<Fact>[] and store.Observe(atom).subscribe(result => trace.push(new ArraySet(result))):`,
                                            () =>
                                            {
                                                describe(
                                                    `Given e1.a1 = undefined:`,
                                                    () =>
                                                    {
                                                        const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                        const fact: Fact = [entities.e1, 'a1', value];
                                                        const trace: Set<Fact>[] = [];
                                                        const subscription = store.Observe(atom).subscribe(result => trace.push(new ArraySet(result)));
                                                        entities.e1.a1 = undefined;
                                                        subscription.unsubscribe();

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
                                                    `Given trace: Set<Fact>[] and store.Observe(atom).subscribe(result => trace.push(new ArraySet(result))):`,
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
                                                                const subscription = store.Observe(atom).subscribe(result => trace.push(new ArraySet(result)));
                                                                entities.e1.a1 = after;
                                                                subscription.unsubscribe();

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
                                                `Given trace: Set<Fact>[] and store.Observe(atom).subscribe(result => trace.push(new ArraySet(result))):`,
                                                () =>
                                                {
                                                    describe(
                                                        `Given e1.a1.${method}(${value}):`,
                                                        () =>
                                                        {
                                                            const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                            const fact: Fact = [entities.e1, 'a1', value];
                                                            const trace: Set<Fact>[] = [];
                                                            const subscription = store.Observe(atom).subscribe(result => trace.push(new ArraySet(result)));
                                                            entities.e1.a1[method](value);
                                                            subscription.unsubscribe();

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
                                                `Given trace: Set<Fact>[] and store.Observe(atom).subscribe(result => trace.push(new ArraySet(result))):`,
                                                () =>
                                                {
                                                    describe(
                                                        `Given e1.a1.${method}():`,
                                                        () =>
                                                        {
                                                            const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                            const fact: Fact = [entities.e1, 'a1', value];
                                                            const trace: Set<Fact>[] = [];
                                                            const subscription = store.Observe(atom).subscribe(result => trace.push(new ArraySet(result)));
                                                            entities.e1.a1[method]();
                                                            subscription.unsubscribe();

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
                                                    `Given trace: Set<Fact>[] and store.Observe(atom).subscribe(result => trace.push(new ArraySet(result))):`,
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
                                                                const subscription = store.Observe(atom).subscribe(result => trace.push(new ArraySet(result)));
                                                                entities.e1.a1.splice(o, 1, after);
                                                                subscription.unsubscribe();

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
                                                    `Given trace: Set<Fact>[] and store.Observe(atom).subscribe(result => trace.push(new ArraySet(result))):`,
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
                                                                const subscription = store.Observe(atom).subscribe(result => trace.push(new ArraySet(result)));
                                                                entities.e1.a1[0] = after;
                                                                subscription.unsubscribe();

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
