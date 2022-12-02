import { } from 'jasmine';
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
                    'LessThan',
                    'LessThanOrEqual',
                    'Equal',
                    'NotEqual',
                    'GreaterThanOrEqual',
                    'GreaterThan',
                    'store',
                    'e')(
                        LessThan,
                        LessThanOrEqual,
                        Equal,
                        NotEqual,
                        GreaterThanOrEqual,
                        GreaterThan,
                        store,
                        e);
                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThan('?result', 0)]).flat().length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThan('?result', 0)]).flat().includes(-1)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThanOrEqual('?result', 0)]).flat().length === 2");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThanOrEqual('?result', 0)]).flat().includes(-1)");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThanOrEqual('?result', 0)]).flat().includes(0)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], Equal('?result', 0)]).flat().length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], Equal('?result', 0)]).flat().includes(0)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], NotEqual('?result', 0)]).flat().length === 2");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], NotEqual('?result', 0)]).flat().includes(-1)");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], NotEqual('?result', 0)]).flat().includes(1)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThanOrEqual('?result', 0)]).flat().length === 2");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThanOrEqual('?result', 0)]).flat().includes(0)");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThanOrEqual('?result', 0)]).flat().includes(1)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThan('?result', 0)]).flat().length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThan('?result', 0)]).flat().includes(1)");


                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThan(0, '?result')]).flat().length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThan(0, '?result')]).flat().includes(1)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThanOrEqual(0, '?result')]).flat().length === 2");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThanOrEqual(0, '?result')]).flat().includes(0)");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], LessThanOrEqual(0, '?result')]).flat().includes(1)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], Equal(0, '?result')]).flat().length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], Equal(0, '?result')]).flat().includes(0)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], NotEqual(0, '?result')]).flat().length === 2");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], NotEqual(0, '?result')]).flat().includes(-1)");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], NotEqual(0, '?result')]).flat().includes(1)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThanOrEqual(0, '?result')]).flat().length === 2");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThanOrEqual(0, '?result')]).flat().includes(-1)");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThanOrEqual(0, '?result')]).flat().includes(0)");

                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThan(0, '?result')]).flat().length === 1");
                assert("store.Query(['?result'], [[e, 'a1', '?result'], GreaterThan(0, '?result')]).flat().includes(-1)");

                assert(`store.Query([1], [LessThan          (-1, 0)]).length === 1`);
                assert(`store.Query([1], [LessThanOrEqual   (-1, 0)]).length === 1`);
                assert(`store.Query([1], [Equal             (-1, 0)]).length === 0`);
                assert(`store.Query([1], [NotEqual          (-1, 0)]).length === 1`);
                assert(`store.Query([1], [GreaterThanOrEqual(-1, 0)]).length === 0`);
                assert(`store.Query([1], [GreaterThan       (-1, 0)]).length === 0`);
                assert(`store.Query([1], [LessThan          ( 0, 0)]).length === 0`);
                assert(`store.Query([1], [LessThanOrEqual   ( 0, 0)]).length === 1`);
                assert(`store.Query([1], [Equal             ( 0, 0)]).length === 1`);
                assert(`store.Query([1], [NotEqual          ( 0, 0)]).length === 0`);
                assert(`store.Query([1], [GreaterThanOrEqual( 0, 0)]).length === 1`);
                assert(`store.Query([1], [GreaterThan       ( 0, 0)]).length === 0`);
                assert(`store.Query([1], [LessThan          ( 1, 0)]).length === 0`);
                assert(`store.Query([1], [LessThanOrEqual   ( 1, 0)]).length === 0`);
                assert(`store.Query([1], [Equal             ( 1, 0)]).length === 0`);
                assert(`store.Query([1], [NotEqual          ( 1, 0)]).length === 1`);
                assert(`store.Query([1], [GreaterThanOrEqual( 1, 0)]).length === 1`);
                assert(`store.Query([1], [GreaterThan       ( 1, 0)]).length === 1`);
            });

        const o1 = { Lhs: 1, Rhs: 2, Result: 3 };
        describe(
            `Given store = new EavStore() and e = store.Assert(${JSON.stringify(o1)}):`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const e = store.Assert(o1);
                let assert = assertBuilder(
                    'Add',
                    'store',
                    'e')(
                        Add,
                        store,
                        e);
                assert("store.Query(['?result'], [[e, 'Lhs', '?lhs'], [e, 'Rhs', '?rhs'], Add('?lhs', '?rhs', '?result')]).flat().length === 1");
                assert("store.Query(['?result'], [[e, 'Lhs', '?lhs'], [e, 'Rhs', '?rhs'], Add('?lhs', '?rhs', '?result')]).flat().includes(3)");
                assert("store.Query(['?entity'], [['?entity', 'Lhs', '?lhs'], ['?entity', 'Rhs', '?rhs'], ['?entity', 'Result', '?result'], Add('?lhs', '?rhs', '?result')]).flat().length === 1");
                assert("store.Query(['?entity'], [['?entity', 'Lhs', '?lhs'], ['?entity', 'Rhs', '?rhs'], ['?entity', 'Result', '?result'], Add('?lhs', '?rhs', '?result')]).flat().includes(e)");
                assert("store.Query(['?result'], [Add(1, 2, '?result')]).flat().length === 1");
                assert("store.Query(['?result'], [Add(1, 2, '?result')]).flat().includes(3)");
                assert("store.Query(['?lhs'], [[e, 'Lhs', '?lhs'], Add('?lhs', 2, 3)]).flat().length === 1");
                assert("store.Query(['?lhs'], [[e, 'Lhs', '?lhs'], Add('?lhs', 2, 3)]).flat().includes(1)");
                assert("store.Query(['?lhs'], [[e, 'Lhs', '?lhs'], Add('?lhs', 2, 4)]).flat().length === 0");
            });
    });
