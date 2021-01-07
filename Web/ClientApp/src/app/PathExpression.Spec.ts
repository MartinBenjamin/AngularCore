import { } from 'jasmine';
import { assertBuilder } from './Ontology/assertBuilder';
import { Any, Alternative, Empty, OneOrMore, Property, Query, Sequence, ZeroOrMore, ZeroOrOne } from './PathExpression';

describe(
    'Path Expression',
    () =>
    {
        describe(
            'Given o = { A: {}, B: [{}, { B: [{}] }], C: {} }',
            () =>
            {
                let o = { A: {}, B: [{}, { B: [{}] }], C: {} };
                let assert = assertBuilder(
                    'o', 'Any', 'Alternative', 'Empty', 'OneOrMore', 'Property', 'Query', 'Sequence', 'ZeroOrMore', 'ZeroOrOne')
                    (o, Any, Alternative, Empty, OneOrMore, Property, Query, Sequence, ZeroOrMore, ZeroOrOne);

                console.log(Query(o,Any).size);
                assert(`Query(o, Empty).size === 1`);
                assert(`Query(o, Empty).has(o)`);
                assert(`Query(o, new Property('A')).size === 1`);
                assert(`Query(o, new Property('A')).has(o.A)`);
                assert(`Query(o, new Property('X')).size === 0`);
                assert(`Query(o, new Property('B')).size === 2`);
                assert(`Query(o, new Property('B')).has(o.B[0])`);
                assert(`Query(o, new Property('B')).has(o.B[1])`);
                assert(`Query(o, new Alternative([new Property('A'), new Property('C')])).size === 2`);
                assert(`Query(o, new Alternative([new Property('A'), new Property('C')])).has(o.A)`);
                assert(`Query(o, new Alternative([new Property('A'), new Property('C')])).has(o.C)`);
                assert(`Query(o, new Sequence([new Property('B'), new Property('B')])).size === 1`);
                assert(`Query(o, new Sequence([new Property('B'), new Property('B')])).has(o.B[1].B[0])`);
                assert(`Query(o, new ZeroOrOne(new Property('A'))).size === 2`);
                assert(`Query(o, new ZeroOrOne(new Property('A'))).has(o)`);
                assert(`Query(o, new ZeroOrOne(new Property('A'))).has(o.A)`);
                assert(`Query(o, new ZeroOrMore(new Property('B'))).size === 4`);
                assert(`Query(o, new ZeroOrMore(new Property('B'))).has(o)`);
                assert(`Query(o, new ZeroOrMore(new Property('B'))).has(o.B[0])`);
                assert(`Query(o, new ZeroOrMore(new Property('B'))).has(o.B[1])`);
                assert(`Query(o, new ZeroOrMore(new Property('B'))).has(o.B[1].B[0])`);
                assert(`Query(o, new OneOrMore(new Property('B'))).size === 3`);
                assert(`Query(o, new OneOrMore(new Property('B'))).has(o.B[0])`);
                assert(`Query(o, new OneOrMore(new Property('B'))).has(o.B[1])`);
                assert(`Query(o, new OneOrMore(new Property('B'))).has(o.B[1].B[0])`);
                assert(`Query(o, Any).size === 4`);
                assert(`Query(o, Any).has(o.A)`);
                assert(`Query(o, Any).has(o.B[0])`);
                assert(`Query(o, Any).has(o.B[1])`);
                assert(`Query(o, Any).has(o.C)`);
            });
    });
