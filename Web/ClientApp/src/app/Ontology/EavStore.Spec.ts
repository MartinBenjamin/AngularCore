import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ArraySet } from './ArraySet';
import { assertBuilder } from './assertBuilder';
import { ArrayProxyFactory, EavStore, TargetSymbol } from './EavStore';
import { Cardinality, Fact, IEavStore, Store } from './IEavStore';
import { IPublisher } from './IPublisher';

class DummyPublisher implements IPublisher
{
    SuspendPublish(): void
    {
    }

    UnsuspendPublish(): void
    {
    }

    PublishAssert(entity: any, attribute: string | number | symbol, value: any): void
    {
    }

    PublishRetract(entity: any, attribute: string | number | symbol, value: any): void
    {
    }

    PublishAssertRetract(entity: any, attribute: string | number | symbol, assertedValue: any, retractedValue: any): void
    {
    }
}

class TestObject
{
    [Symbol.toPrimitive](
        hint: string
        )
    {
    }
}

class TestObject2 extends TestObject
{
}

describe(
    'Entity Attribute Value Store',
    () =>
    {
        describe(
            'Given array = [] and arrayProxy = ArrayProxyFactory(null, null, array):',
            () =>
            {
                const array = [];
                const arrayProxy = ArrayProxyFactory(new DummyPublisher(), null, null, array)
                const x = {};
                let assert = assertBuilder('array', 'arrayProxy', 'x', 'TargetSymbol')
                    (array, arrayProxy, x, TargetSymbol);
                assert('arrayProxy[TargetSymbol] === array');
                assert('arrayProxy.push(x) === 1');
                assert('array.includes(x)');
                assert('arrayProxy.includes(x)');
                assert('arrayProxy.length === 1');
                assert('arrayProxy[0] === x')
                assert('arrayProxy.pop() === x');
                assert('array.length === 0');
                assert('arrayProxy.length === 0');
                assert('array.pop() === undefined');
                assert('arrayProxy.pop() === undefined');

                assert('arrayProxy.unshift(x) === 1');
                assert('array.includes(x)');
                assert('arrayProxy.includes(x)');
                assert('arrayProxy.length === 1');
                assert('arrayProxy[0] === x')
                assert('arrayProxy.shift() === x');
                assert('array.length === 0');
                assert('arrayProxy.length === 0');
                assert('array.shift() === undefined');
                assert('arrayProxy.shift() === undefined');

                assert('arrayProxy.splice(0, 0, x).length === 0');
                assert('array.includes(x)');
                assert('arrayProxy.includes(x)');
                assert('arrayProxy.length === 1');
                assert('arrayProxy[0] === x')
                assert('arrayProxy.splice(0, 1).includes(x)');
                assert('array.length === 0');
                assert('arrayProxy.length === 0');
            });

        describe(
            `Given store = new EavStore(), o = new TestObject() and e = store.Assert(o):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const o = new TestObject();
                const e = store.Assert(o);

                let assert = assertBuilder('TestObject', 'o', 'e')
                    (TestObject, o, e);

                assert('o instanceof TestObject');
                assert("typeof Reflect.getPrototypeOf(o)[Symbol.toPrimitive] === 'function'")
                assert("typeof o[Symbol.toPrimitive] === 'function'")
                assert('Reflect.getPrototypeOf(o) === Reflect.getPrototypeOf(e)');
                assert('e instanceof TestObject');
                assert("typeof Reflect.getPrototypeOf(e)[Symbol.toPrimitive] === 'function'")
                assert("typeof e[Symbol.toPrimitive] === 'function'")
                assert("o[Symbol.toPrimitive] === e[Symbol.toPrimitive]")
            });

        describe(
            `Given store = new EavStore(), o = new TestObject2() and e = store.Assert(o):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const o = new TestObject2();
                const e = store.Assert(o);

                let assert = assertBuilder('TestObject', 'TestObject2', 'o', 'e')
                    (TestObject, TestObject2, o, e);

                assert('o instanceof TestObject');
                assert('o instanceof TestObject2');
                assert("typeof Reflect.getPrototypeOf(o)[Symbol.toPrimitive] === 'function'")
                assert("typeof o[Symbol.toPrimitive] === 'function'")
                assert('Reflect.getPrototypeOf(o) === Reflect.getPrototypeOf(e)');
                assert('e instanceof TestObject');
                assert('e instanceof TestObject2');
                assert("typeof Reflect.getPrototypeOf(e)[Symbol.toPrimitive] === 'function'")
                assert("typeof e[Symbol.toPrimitive] === 'function'")
                assert("o[Symbol.toPrimitive] === e[Symbol.toPrimitive]")
            });

        const o = { a1: 1, a2: [{ a1: 2, a3: 3 }], a4: null, [Symbol.toPrimitive]: function(){ } };
        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                //const o = { a1: 1, a2: [{ a1: 2, a3: 3 }], a4: null };
                const e = store.Assert(o);
                let assert = assertBuilder('Store', 'store', 'e')
                    (Store, store, e);

                const originalKeys: string[] = [];
                for(const key in o)
                    originalKeys.push(key);

                const keys = new Set<PropertyKey>();
                for(const key in e)
                    keys.add(key);

                assert('e.a1 === 1');
                assert("typeof e.a2 === 'object'");
                assert('e.a2 instanceof Array');
                assert('Array.isArray(e.a2)');
                assert('e.a2.length === 1');
                assert("typeof e.a2[0] === 'object'");
                assert('e.a2[0].a1 === 2');
                assert('e.a2[0].a3 === 3');
                assert('e.a4 === null');
                assert("typeof e.a5 === 'undefined'");
                //assert(`Reflect.ownKeys(e).length === ${Reflect.ownKeys(o).length}`);
                for(const ownKey of Reflect.ownKeys(o))
                    it(
                        `Reflect.ownKeys(e).includes('${String(ownKey)}')`,
                        () => expect(Reflect.ownKeys(e).includes(ownKey)).toBe(true));
                it(
                    `for...in e has ${originalKeys.length} keys`,
                    () => expect(keys.size).toBe(originalKeys.length));
                for(const key of originalKeys)
                    it(
                        `for...in e includes '${key}'`,
                        () => expect(keys.has(key)).toBe(true));
                for(const key in e)
                    assert(`'${key}' in e`);
                assert("!('a3' in e)");
                assert('Store(e) === store');
                assert('Store(e.a2[0]) === store');

                assert("store.Query(['?result'], []).length === 1");
                assert("store.Query(['?result'], [])[0].length === 1");
                assert("store.Query(['?result'], [])[0][0] === '?result'");
                assert("store.Query(['?result'], [[e, 'a1', '?result']]).length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result']])[0].length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result']])[0][0] === e.a1");
                assert("store.Query(['?result'], [[e, 'a2', '?a2'], ['?a2', 'a3', '?result']]).length === 1");
                assert("store.Query(['?result'], [[e, 'a2', '?a2'], ['?a2', 'a3', '?result']])[0].length === 1");
                assert("store.Query(['?result'], [[e, 'a2', '?a2'], ['?a2', 'a3', '?result']])[0][0] === e.a2[0].a3");

                describe(
                    'Given entities: Set<any> and store.Entities.subscribe(value => entities = value):',
                    () =>
                    {
                        let entities: Set<any>;
                        const subscription: Subscription = store.ObserveEntities().subscribe(value => entities = value);
                        let assert = assertBuilder('store', 'e', 'entities')
                            (store, e, entities);

                        assert('entities.size === 2');
                        assert('entities.has(e)');
                        assert('entities.has(e.a2[0])');
                        assert('!entities.has(e.a4)');
                        subscription.unsubscribe();
                    });

                describe(
                    "Given a1: Set<[any, any]>and store.Observe('a1').subscribe(value => a1 = new ArraySet(value)):",
                    () =>
                    {
                        let a1: Set<[any, any]>;
                        const subscription: Subscription = store.Observe('a1').subscribe(value => a1 = new ArraySet(value));
                        let assert = assertBuilder('store', 'e', 'a1')
                            (store, e, a1);

                        assert('a1.size === 2');
                        assert('a1.has([e, e.a1])');
                        assert('a1.has([e.a2[0], e.a2[0].a1])');

                        describe(
                            'Given e1 = store.Assert({ a1: 3 }):',
                            () =>
                            {
                                const e1 = store.Assert({ a1: 3 });
                                let assert = assertBuilder('store', 'e', 'e1', 'a1')
                                    (store, e, e1, a1);
                                assert('a1.size === 3');
                                assert('a1.has([e, e.a1])');
                                assert('a1.has([e.a2[0], e.a2[0].a1])');
                                assert('a1.has([e1, e1.a1])');
                            });
                        subscription.unsubscribe();
                    });

                describe(
                    "Given a2: Set<[any, any]> and store.Observe('a2').subscribe(value => a2 = new ArraySet(value)):",
                    () =>
                    {
                        let a2: Set<[any, any]>;
                        const subscription: Subscription = store.Observe('a2').subscribe(value => a2 = new ArraySet(value));
                        let assert = assertBuilder('store', 'e', 'a2')
                            (store, e, a2);

                        assert('a2.size === 1');
                        assert('a2.has([e, e.a2[0]])');
                        subscription.unsubscribe();
                    });
            });

        describe(
            "Given store = new EavStore({ Name: 'Id', UniqueIdentity: true}) and e = store.Assert({ Id: 1 })",
            () =>
            {
                const store: IEavStore = new EavStore([{ Name: 'Id', UniqueIdentity: true, Cardinality: Cardinality.One }]);
                const e = store.Assert({ Id: 1 });
                let assert = assertBuilder('store', 'e')
                    (store, e);
                assert('e.Id === 1');
                assert('e === store.Assert({ Id: 1 })');
                assert('e !== store.Assert({ Id: 2 })');
                assert("typeof e.a1 === 'undefined' && e === store.Assert({ Id: 1, a1: 2 }) && e.a1 === 2");
            });

        describe(
            "EavStore.Query(atom: Fact): Fact[]",
            () =>
            {

                const entityIds = [undefined, 'e1', 'e2'];
                const attributes = [undefined, 'a1', 'a2'];
                const values = [undefined, 0, 1];
                for(const value of values)
                {
                    let o: any = {};
                    if(value != undefined)
                        o.a1 = value;

                    describe(
                        `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                        () =>
                        {
                            const store: IEavStore = new EavStore();
                            const entities = {
                                e1: store.Assert(o),
                                e2: store.Assert({})
                            };

                            for(const entityId of entityIds)
                                for(const atomAttribute of attributes)
                                    for(const atomValue of values)
                                        describe(
                                            `Given facts = new ArraySet(store.Query(<Fact>[${entityId}, ${atomAttribute}, ${atomValue}]))`,
                                            () =>
                                            {
                                                const atom: Fact = [entityId ? entities[entityId] : undefined, atomAttribute, atomValue];
                                                const facts = new ArraySet(store.Query(atom));

                                                if(value != undefined && // There is an attribute.
                                                    (atom[0] === undefined || atom[0] === entities.e1) &&
                                                    (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                    (atom[2] === undefined || atom[2] === value      ))
                                                    it(
                                                        `facts.has([e1, 'a1', ${value}])`,
                                                        () => expect(facts.has([entities.e1, 'a1', value])).toBe(true));
                                                else
                                                    it(
                                                        `!facts.has([e1, 'a1', ${value}])`,
                                                        () => expect(facts.has([entities.e1, 'a1', value])).toBe(false));
                                            });
                        });
                }

                for(const value of values)
                {
                    let o: any = {};
                    if(value != undefined)
                        o.a1 = [value];

                    describe(
                        `Given store = new EavStore(), e1 = store.Assert(${JSON.stringify(o)}) and e2 = store.Assert({}):`,
                        () =>
                        {
                            const store: IEavStore = new EavStore();
                            const entities = {
                                e1: store.Assert(o),
                                e2: store.Assert({})
                            };

                            for(const entityId of entityIds)
                                for(const atomAttribute of attributes)
                                    for(const atomValue of values)
                                        describe(
                                            `Given facts = new ArraySet(store.Query(<Fact>[${entityId}, ${atomAttribute}, ${atomValue}]))`,
                                            () =>
                                            {
                                                const atom: Fact = [entityId ? entities[entityId] : undefined, atomAttribute, atomValue];
                                                const facts = new ArraySet(store.Query(atom));

                                                if(value != undefined && // There is an attribute.
                                                    (atom[0] === undefined || atom[0] === entities.e1) &&
                                                    (atom[1] === undefined || atom[1] === 'a1') &&
                                                    (atom[2] === undefined || atom[2] === value))
                                                    it(
                                                        `facts.has([e1, 'a1', ${value}])`,
                                                        () => expect(facts.has([entities.e1, 'a1', value])).toBe(true));
                                                else
                                                    it(
                                                        `!facts.has([e1, 'a1', ${value}])`,
                                                        () => expect(facts.has([entities.e1, 'a1', value])).toBe(false));
                                            });
                        });
                }
            });

        describe(
            "EavStore.Observe(atom: Fact): Fact[]",
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
                                                            `Given facts: Set<Fact> and store.Observe(atom).subscribe(result => facts = new ArraySet(result)):`,
                                                            () =>
                                                            {
                                                                const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                                const beforeFact: Fact = [entities.e1, 'a1', before];
                                                                let facts: Set<Fact>;
                                                                store.Observe(atom).subscribe(result => facts = new ArraySet(result));

                                                                const beforeHas = facts.has(beforeFact);
                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === before     ))
                                                                    it(
                                                                        `facts.has([e1, 'a1', ${before}])`,
                                                                        () => expect(beforeHas).toBe(true));
                                                                else
                                                                    it(
                                                                        `!facts.has([e1, 'a1', ${before}])`,
                                                                        () => expect(beforeHas).toBe(false));

                                                                describe(
                                                                    `Given e1.a1.splice(o, 1, ${after}):`,
                                                                    () =>
                                                                    {
                                                                        entities.e1.a1.splice(o, 1, after);
                                                                        const afterFact: Fact = [entities.e1, 'a1', after];

                                                                        it(
                                                                            `!facts.has([e1, 'a1', ${before}])`,
                                                                            () => expect(facts.has(beforeFact)).toBe(false));

                                                                        if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                           (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                           (atom[2] === undefined || atom[2] === after      ))
                                                                            it(
                                                                                `facts.has([e1, 'a1', ${after}])`,
                                                                                () => expect(facts.has(afterFact)).toBe(true));
                                                                        else
                                                                            it(
                                                                                `!facts.has([e1, 'a1', ${after}])`,
                                                                                () => expect(facts.has(afterFact)).toBe(false));
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
                                                            `Given facts: Set<Fact> and store.Observe(atom).subscribe(result => facts = new ArraySet(result)):`,
                                                            () =>
                                                            {
                                                                const atom: Fact = [atomEntityId ? entities[atomEntityId] : undefined, atomAttribute, atomValue];
                                                                const beforeFact: Fact = [entities.e1, 'a1', before];
                                                                let facts: Set<Fact>;
                                                                store.Observe(atom).subscribe(result => facts = new ArraySet(result));

                                                                const beforeHas = facts.has(beforeFact);
                                                                if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                   (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                                   (atom[2] === undefined || atom[2] === before     ))
                                                                    it(
                                                                        `facts.has([e1, 'a1', ${before}])`,
                                                                        () => expect(beforeHas).toBe(true));
                                                                else
                                                                    it(
                                                                        `!facts.has([e1, 'a1', ${before}])`,
                                                                        () => expect(beforeHas).toBe(false));

                                                                describe(
                                                                    `Given e1.a1[0] = ${after}:`,
                                                                    () =>
                                                                    {
                                                                        entities.e1.a1[0] = after;
                                                                        const afterFact: Fact = [entities.e1, 'a1', after];

                                                                        it(
                                                                            `!facts.has([e1, 'a1', ${before}])`,
                                                                            () => expect(facts.has(beforeFact)).toBe(false));

                                                                        if((atom[0] === undefined || atom[0] === entities.e1) &&
                                                                            (atom[1] === undefined || atom[1] === 'a1') &&
                                                                            (atom[2] === undefined || atom[2] === after))
                                                                            it(
                                                                                `facts.has([e1, 'a1', ${after}])`,
                                                                                () => expect(facts.has(afterFact)).toBe(true));
                                                                        else
                                                                            it(
                                                                                `!facts.has([e1, 'a1', ${after}])`,
                                                                                () => expect(facts.has(afterFact)).toBe(false));
                                                                    });
                                                            });
                                                    });
                                            }
                                });
                        }
            });
    });
