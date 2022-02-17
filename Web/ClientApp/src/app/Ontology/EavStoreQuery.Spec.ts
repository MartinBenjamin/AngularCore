import { } from 'jasmine';
import { ArraySet } from './ArraySet';
import { assertBuilder } from './assertBuilder';
import { Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, NotEqual } from './Atom';
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
            });
    });
