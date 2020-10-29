import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectSomeValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectProperty op1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let op1 = new ObjectProperty(o1, 'op1');
                describe(
                    `Given o1 declares individuals i1, i2 and Class c1 with member i1:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'ObjectSomeValuesFrom', 'op1', 'c1', 'i1', 'i2')
                            (evaluator, ObjectSomeValuesFrom, op1, c1, i1, i2);
                        new ObjectSomeValuesFrom(op1, c1).Evaluate(evaluator, {op1: [ i1 ]})
                        assert('new ObjectSomeValuesFrom(op1, c1).Evaluate(evaluator, { op1: [] }) === false');
                        assert('new ObjectSomeValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i1 ] })');
                        assert('new ObjectSomeValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i1, i2 ] })');
                        assert('new ObjectSomeValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i2 ] }) === false');
                    });
            });
    });
