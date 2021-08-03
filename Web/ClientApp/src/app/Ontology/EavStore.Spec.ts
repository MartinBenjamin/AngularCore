import { } from 'jasmine';
import { ArrayProxyFactory, EavStore } from './IEavStore';
import { assertBuilder } from './assertBuilder';

describe(
    'Entity Attribute Value Store',
    () =>
    {
        describe(
            'Given array = [] and arrayProxy = ArrayProxyFactory(null, null, array)',
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

                assert('arrayProxy.unshift(x) === 1');
                assert('array.includes(x)');
                assert('arrayProxy.includes(x)');
                assert('arrayProxy.length === 1');
                assert('arrayProxy[0] === x')
                assert('arrayProxy.shift() === x');
                assert('array.length === 0');
                assert('arrayProxy.length === 0');

                assert('arrayProxy.push(x) === 1');
                assert('arrayProxy.splice(0, 1).includes(x)');
                assert('array.length === 0');
                assert('arrayProxy.length === 0');
            });

        describe(
            'Given store = new EavStore() and p = store.Import({ a1:1, a2: [{a3: 2}], a4: null })',
            () =>
            {
                const store = new EavStore();
                const p = store.Import({ a1: 1, a2: [{ a3: 2 }], a4: null });
                let assert = assertBuilder('store', 'p')
                    (store, p);
                assert('p.a1 === 1');
                assert("typeof p.a2 === 'object'");
                assert('p.a2 instanceof Array');
                assert('Array.isArray(p.a2)');
                assert('p.a2.length === 1');
                assert("typeof p.a2[0] === 'object'");
                assert("p.a2[0].a3 === 2");
                assert("p.a4 === null");
                assert("typeof p.a5 === 'undefined'");
            });

        describe(
            "Given store = new EavStore({ Name: 'Id', UniqueIdentity: true}) and p = store.Import({ Id: 1 })",
            () =>
            {
                const store = new EavStore({ Name: 'Id', UniqueIdentity: true });
                const p = store.Import({ Id: 1 });
                let assert = assertBuilder('store', 'p')
                    (store, p);
                assert('p.Id === 1');
                assert('p === store.Import({ Id: 1 })');
                assert('store.Import({ Id: 1, a1: 2 }).a1 === 2');
            });
    });
