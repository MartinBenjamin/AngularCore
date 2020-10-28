import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { IDataPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { DataPropertyExpression } from './Property';

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
                    'Given o1 declares DataPropertyExpression dpe1:',
                    () =>
                    {
                        let dpe1 = new DataPropertyExpression(o1, 'dpe1');
                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        let assert = assertBuilder('o1', 'evaluator', 'dpe1')(o1, evaluator, dpe1);
                        assert('dpe1.Ontology === o1');
                        assert('o1.Axioms.includes(dpe1)');
                        it(
                            'Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dpe1)',
                            () => expect(Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dpe1)).toBe(true));
                        assert('Array.isArray(evaluator.DataPropertyValues(dpe1, {}))');
                        assert('evaluator.DataPropertyValues(dpe1, {}).length === 0');
                        assert('evaluator.DataPropertyValues(dpe1, { dpe1: null }).length === 0');

                        describe(
                            'Given result = evaluator.DataPropertyValues(dpe1, { dpe1: 6 })',
                            () =>
                            {
                                let result = evaluator.DataPropertyValues(dpe1, { dpe1: 6 });
                                let assert = assertBuilder('result')(result);
                                assert('result.length === 1');
                                assert('result.includes(6)');
                            });

                        describe(
                            'Given result = evaluator.DataPropertyValues(dpe1, { dpe1: [1, 2] })',
                            () =>
                            {
                                let result = evaluator.DataPropertyValues(dpe1, { dpe1: [1, 2] });
                                let assert = assertBuilder('result')(result);
                                assert('result.length === 2');
                                assert('!result.includes(0)');
                                assert('result.includes(1)');
                                assert('result.includes(2)');
                                assert('!result.includes(3)');
                            });

                        describe(
                            'Given result = evaluator.DataPropertyValues(dpe1, { dpe1: new Set([1, 2]) })',
                            () =>
                            {
                                let result = evaluator.DataPropertyValues(dpe1, { dpe1: new Set([1, 2]) });
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
