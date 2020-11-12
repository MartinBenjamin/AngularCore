import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { DataHasValue } from './DataHasValue';
import { EquivalentClasses } from './EquivalentClasses';
import { Ontology } from './Ontology';
import { DataProperty } from './Property';

describe(
    'EquivalentClasses',
    () =>
    {
        describe(
            'Given ontology o1 with declarations Class(c1), DataProperty(dp1) and axiom EquivalentClasses(c1, DataHasValue(dp1, 1)):',
            () =>
            {
                let o1 = new Ontology('o1');
                let c1 = new Class(o1, 'c1');
                let dp1 = new DataProperty(o1, 'dp1');
                new EquivalentClasses(o1, [c1, new DataHasValue(dp1, 1)]);

                describe(
                    'Given an individual i = { dp1: 1 } and result = o1.Classify(i)',
                    () =>
                    {
                        let i = { dp1: 1 };
                        let result = o1.Classify(i);
                        let assert = assertBuilder('i', 'result', 'c1')(i, result, c1);
                        assert('result.has(i)')
                        assert('result.get(i).size === 1');
                        assert('result.get(i).has(c1)');
                    });
            });
    });
