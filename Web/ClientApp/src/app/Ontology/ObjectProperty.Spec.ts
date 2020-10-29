import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IObjectPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectProperty',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1 = new Ontology('o1');

                describe(
                    'Given o1 declares ObjectProperty op1:',
                    () =>
                    {
                        let op1 = new ObjectProperty(o1, 'op1');
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('o1', 'evaluator', 'op1')(o1, evaluator, op1);
                        assert('op1.Ontology === o1');
                        assert('o1.Axioms.includes(op1)');
                        it(
                            'Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(op1)',
                            () => expect(Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(op1)).toBe(true));
                        assert('evaluator.ObjectPropertyValues(op1, {}).length === 0');
                        assert('evaluator.ObjectPropertyValues(op1, { op1: null }).length === 0');

                        describe(
                            'Given result = evaluator.ObjectPropertyValues(op1, { op1: 6 })',
                            () =>
                            {
                                let result = evaluator.ObjectPropertyValues(op1, { op1: 6 });
                                let assert = assertBuilder('result')(result);
                                assert('result.length === 1');
                                assert('result.includes(6)');
                            });

                        describe(
                            'Given result = evaluator.ObjectPropertyValues(op1, { op1: [1, 2] })',
                            () =>
                            {
                                let result = evaluator.ObjectPropertyValues(op1, { op1: [1, 2] });
                                let assert = assertBuilder('result')(result);
                                assert('result.length === 2');
                                assert('!result.includes(0)');
                                assert('result.includes(1)');
                                assert('result.includes(2)');
                                assert('!result.includes(3)');
                            });

                        describe(
                            'Given result = evaluator.ObjectPropertyValues(op1, { op1: new Set([1, 2]) })',
                            () =>
                            {
                                let result = evaluator.ObjectPropertyValues(op1, { op1: new Set([1, 2]) });
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
