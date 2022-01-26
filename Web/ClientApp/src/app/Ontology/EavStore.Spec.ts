import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ArraySet } from './ArraySet';
import { assertBuilder } from './assertBuilder';
import { ArrayProxyFactory, EavStore } from './EavStore';
import { IEavStore, Store, Fact } from './IEavStore';

describe(
    'Entity Attribute Value Store',
    () =>
    {
        describe(
            'Given array = [] and arrayProxy = ArrayProxyFactory(null, null, array):',
            () =>
            {
                const array = [];
                const arrayProxy = ArrayProxyFactory(null, null, array)
                const x = {};
                let assert = assertBuilder('array', 'arrayProxy', 'x')
                    (array, arrayProxy, x);
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

        const o = { a1: 1, a2: [{ a1: 2, a3: 3 }], a4: null };
        describe(
            `Given store = new EavStore() and e = store.Add(${JSON.stringify(o)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                //const o = { a1: 1, a2: [{ a1: 2, a3: 3 }], a4: null };
                const e = store.Add(o);
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
                        () => expect(Reflect.ownKeys(e).includes(ownKey)));
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

                assert("store.Query(['?result']).length === 1");
                assert("store.Query(['?result'])[0].length === 1");
                assert("store.Query(['?result'])[0][0] === '?result'");
                assert("store.Query(['?result'], [e, 'a1', '?result']).length === 1");
                assert("store.Query(['?result'], [e, 'a1', '?result'])[0].length === 1");
                assert("store.Query(['?result'], [e, 'a1', '?result'])[0][0] === e.a1");
                assert("store.Query(['?result'], [e, 'a2', '?a2'], ['?a2', 'a3', '?result']).length === 1");
                assert("store.Query(['?result'], [e, 'a2', '?a2'], ['?a2', 'a3', '?result'])[0].length === 1");
                assert("store.Query(['?result'], [e, 'a2', '?a2'], ['?a2', 'a3', '?result'])[0][0] === e.a2[0].a3");

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
                    "Given a1: Set<[any, any]>and store.ObserveAttribute('a1').subscribe(value => a1 = new ArraySet(value)):",
                    () =>
                    {
                        let a1: Set<[any, any]>;
                        const subscription: Subscription = store.ObserveAttribute('a1').subscribe(value => a1 = new ArraySet(value));
                        let assert = assertBuilder('store', 'e', 'a1')
                            (store, e, a1);

                        assert('a1.size === 2');
                        assert('a1.has([e, e.a1])');
                        assert('a1.has([e.a2[0], e.a2[0].a1])');

                        describe(
                            'Given e1 = store.Add({ a1: 3 }):',
                            () =>
                            {
                                const e1 = store.Add({ a1: 3 });
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
                    "Given a2: Set<[any, any]> and store.ObserveAttribute('a2').subscribe(value => a2 = new ArraySet(value)):",
                    () =>
                    {
                        let a2: Set<[any, any]>;
                        const subscription: Subscription = store.ObserveAttribute('a2').subscribe(value => a2 = new ArraySet(value));
                        let assert = assertBuilder('store', 'e', 'a2')
                            (store, e, a2);

                        assert('a2.size === 1');
                        assert('a2.has([e, e.a2[0]])');
                        subscription.unsubscribe();
                    });
            });

        describe(
            "Given store = new EavStore({ Name: 'Id', UniqueIdentity: true}) and e = store.Add({ Id: 1 })",
            () =>
            {
                const store: IEavStore = new EavStore({ Name: 'Id', UniqueIdentity: true });
                const e = store.Add({ Id: 1 });
                let assert = assertBuilder('store', 'e')
                    (store, e);
                assert('e.Id === 1');
                assert('e === store.Add({ Id: 1 })');
                assert('e !== store.Add({ Id: 2 })');
                assert("typeof e.a1 === 'undefined' && e === store.Add({ Id: 1, a1: 2 }) && e.a1 === 2");
            });

        describe(
            "EavStore.Facts",
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
                        `Given store = new EavStore(), e1 = store.Add(${JSON.stringify(o)}) and e2 = store.Add({}):`,
                        () =>
                        {
                            const store = new EavStore();
                            const entities = {
                                e1: store.Add(o),
                                e2: store.Add({})
                            };

                            for(const entityId of entityIds)
                                for(const atomAttribute of attributes)
                                    for(const atomValue of values)
                                        describe(
                                            `Given facts = new ArraySet(store.Facts(<Fact>[${entityId}, ${atomAttribute}, ${atomValue}]))`,
                                            () =>
                                            {
                                                const atom: Fact = [entityId ? entities[entityId] : undefined, atomAttribute, atomValue];
                                                const facts = new ArraySet(store.Facts(atom));

                                                if(value != undefined && // There is an attribute.
                                                    (atom[0] === undefined || atom[0] === entities.e1) &&
                                                    (atom[1] === undefined || atom[1] === 'a1'       ) &&
                                                    (atom[2] === undefined || atom[2] === value      ))
                                                    it(
                                                        `facts.has([e1, 'a1', ${value}])`,
                                                        () => facts.has([entities.e1, 'a1', value]));
                                                else
                                                    it(
                                                        `!facts.has([e1, 'a1', ${value}])`,
                                                        () => !facts.has([entities.e1, 'a1', value]));
                                            });
                        });
                }

                for(const value of values)
                {
                    let o: any = {};
                    if(value != undefined)
                        o.a1 = [value];

                    describe(
                        `Given store = new EavStore(), e1 = store.Add(${JSON.stringify(o)}) and e2 = store.Add({}):`,
                        () =>
                        {
                            const store = new EavStore();
                            const entities = {
                                e1: store.Add(o),
                                e2: store.Add({})
                            };

                            for(const entityId of entityIds)
                                for(const atomAttribute of attributes)
                                    for(const atomValue of values)
                                        describe(
                                            `Given facts = new ArraySet(store.Facts(<Fact>[${entityId}, ${atomAttribute}, ${atomValue}]))`,
                                            () =>
                                            {
                                                const atom: Fact = [entityId ? entities[entityId] : undefined, atomAttribute, atomValue];
                                                const facts = new ArraySet(store.Facts(atom));

                                                if(value != undefined && // There is an attribute.
                                                    (atom[0] === undefined || atom[0] === entities.e1) &&
                                                    (atom[1] === undefined || atom[1] === 'a1') &&
                                                    (atom[2] === undefined || atom[2] === value))
                                                    it(
                                                        `facts.has([e1, 'a1', ${value}])`,
                                                        () => facts.has([entities.e1, 'a1', value]));
                                                else
                                                    it(
                                                        `!facts.has([e1, 'a1', ${value}])`,
                                                        () => !facts.has([entities.e1, 'a1', value]));
                                            });
                        });
                }
            });
    });
