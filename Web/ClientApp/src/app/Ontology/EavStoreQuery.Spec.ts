import { } from 'jasmine';
import { ArraySet } from './ArraySet';
import { assertBuilder } from './assertBuilder';
import { Add, Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, NotEqual } from './Atom';
import { EavStore } from './EavStore';
import { IEavStore } from './IEavStore';

describe(
    'Query Entity Attribute Value Store',
    () =>
    {
        const o = { a1: [-1, 0, 1] };
        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o);
                let assert = assertBuilder(
                    'ArraySet',
                    'LessThan',
                    'LessThanOrEqual',
                    'Equal',
                    'NotEqual',
                    'GreaterThanOrEqual',
                    'GreaterThan',
                    'store',
                    'e')(
                        ArraySet,
                        LessThan,
                        LessThanOrEqual,
                        Equal,
                        NotEqual,
                        GreaterThanOrEqual,
                        GreaterThan,
                        store,
                        e);
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThan('?result', 0))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThan('?result', 0))).has([-1])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThanOrEqual('?result', 0))).size === 2");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThanOrEqual('?result', 0))).has([-1])");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThanOrEqual('?result', 0))).has([0])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], Equal('?result', 0))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], Equal('?result', 0))).has([0])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], NotEqual('?result', 0))).size === 2");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], NotEqual('?result', 0))).has([-1])");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], NotEqual('?result', 0))).has([1])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThanOrEqual('?result', 0))).size === 2");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThanOrEqual('?result', 0))).has([0])");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThanOrEqual('?result', 0))).has([1])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThan('?result', 0))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThan('?result', 0))).has([1])");


                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThan(0, '?result'))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThan(0, '?result'))).has([1])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThanOrEqual(0, '?result'))).size === 2");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThanOrEqual(0, '?result'))).has([0])");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], LessThanOrEqual(0, '?result'))).has([1])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], Equal(0, '?result'))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], Equal(0, '?result'))).has([0])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], NotEqual(0, '?result'))).size === 2");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], NotEqual(0, '?result'))).has([-1])");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], NotEqual(0, '?result'))).has([1])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThanOrEqual(0, '?result'))).size === 2");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThanOrEqual(0, '?result'))).has([-1])");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThanOrEqual(0, '?result'))).has([0])");

                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThan(0, '?result'))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'a1', '?result'], GreaterThan(0, '?result'))).has([-1])");
            });

        const o1 = { Lhs: 1, Rhs: 2, Result: 3 };
        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o1)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o1);
                let assert = assertBuilder(
                    'ArraySet',
                    'Add',
                    'store',
                    'e')(
                        ArraySet,
                        Add,
                        store,
                        e);
                assert("new ArraySet(store.Query(['?result'], [e, 'Lhs', '?lhs'], [e, 'Rhs', '?rhs'], Add('?lhs', '?rhs', '?result'))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'Lhs', '?lhs'], [e, 'Rhs', '?rhs'], Add('?lhs', '?rhs', '?result'))).has([3])");
                assert("new ArraySet(store.Query(['?result'], [e, 'Lhs', '?lhs'], [e, 'Rhs', '?rhs'], [e, 'Result', '?result'], Add('?lhs', '?rhs', '?result'))).size === 1");
                assert("new ArraySet(store.Query(['?result'], [e, 'Lhs', '?lhs'], [e, 'Rhs', '?rhs'], [e, 'Result', '?result'], Add('?lhs', '?rhs', '?result'))).has([3])");
                assert("new ArraySet(store.Query(['?result'], Add(1, 2, '?result'))).size === 1");
                assert("new ArraySet(store.Query(['?result'], Add(1, 2, '?result'))).has([3])");
                assert("new ArraySet(store.Query(['?lhs'], [e, 'Lhs', '?lhs'], Add('?lhs', 2, 3))).size === 1");
                assert("new ArraySet(store.Query(['?lhs'], [e, 'Lhs', '?lhs'], Add('?lhs', 2, 3))).has([1])");
                assert("new ArraySet(store.Query(['?lhs'], [e, 'Lhs', '?lhs'], Add('?lhs', 2, 4))).size === 0");
            });
    });
