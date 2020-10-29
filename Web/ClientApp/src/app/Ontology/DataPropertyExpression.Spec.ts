import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IDataPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataPropertyExpression',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1 = new Ontology('o1');

                describe(
                    'Given o1 declares DataProperty dp1:',
                    () =>
                    {
                        let dp1 = new DataProperty(o1, 'dp1');
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('o1', 'evaluator', 'dp1')(o1, evaluator, dp1);
                        assert('dp1.Ontology === o1');
                        assert('o1.Axioms.includes(dp1)');
                        it(
                            'Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dp1)',
                            () => expect(Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dp1)).toBe(true));
                        assert('Array.isArray(evaluator.DataPropertyValues(dp1, {}))');
                        assert('evaluator.DataPropertyValues(dp1, {}).length === 0');
                        assert('evaluator.DataPropertyValues(dp1, { dp1: null }).length === 0');

                        describe(
                            'Given result = evaluator.DataPropertyValues(dp1, { dp1: 6 })',
                            () =>
                            {
                                let result = evaluator.DataPropertyValues(dp1, { dp1: 6 });
                                let assert = assertBuilder('result')(result);
                                assert('result.length === 1');
                                assert('result.includes(6)');
                            });

                        describe(
                            'Given result = evaluator.DataPropertyValues(dp1, { dp1: [1, 2] })',
                            () =>
                            {
                                let result = evaluator.DataPropertyValues(dp1, { dp1: [1, 2] });
                                let assert = assertBuilder('result')(result);
                                assert('result.length === 2');
                                assert('!result.includes(0)');
                                assert('result.includes(1)');
                                assert('result.includes(2)');
                                assert('!result.includes(3)');
                            });

                        describe(
                            'Given result = evaluator.DataPropertyValues(dp1, { dp1: new Set([1, 2]) })',
                            () =>
                            {
                                let result = evaluator.DataPropertyValues(dp1, { dp1: new Set([1, 2]) });
                                let assert = assertBuilder('result')(result);
                                assert('result.length === 2');
                                assert('!result.includes(0)');
                                assert('result.includes(1)');
                                assert('result.includes(2)');
                                assert('!result.includes(3)');
                            });
                    });
            });
    });
