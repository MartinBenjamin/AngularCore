import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { NamedIndividual, ObjectPropertyAssertion } from './NamedIndividual';
import { ObjectHasValue } from './ObjectHasValue';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectHasValue',
    () =>
    {
        describe(
            'Given an Ontology o1 whith declarations ObjectProperty(op1), NamedIndividual(i1) and NamedIndividual(i2):',
            () =>
            {
                let o1 = new Ontology('o1');
                let op1 = new ObjectProperty(o1, 'op1');
                let i1  = new NamedIndividual(o1, 'i1');
                let i2  = new NamedIndividual(o1, 'i2');

                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'ObjectHasValue', 'op1', 'i1', 'i2')
                    (evaluator, ObjectHasValue, op1, i1, i2);

                assert('!new ObjectHasValue(op1, i2).Evaluate(evaluator, i1)');

                describe(
                    `Given an additional axiom ObjectPropertyAssertion(op1, i1, i2):`,
                    () =>
                    {
                        new ObjectPropertyAssertion(o1, op1, i1, i2);
                        evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'ObjectHasValue', 'op1', 'i1', 'i2')
                            (evaluator, ObjectHasValue, op1, i1, i2);
                        assert('new ObjectHasValue(op1, i2).Evaluate(evaluator, i1)');
                    });
            });
    });
