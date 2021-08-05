import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassAssertion } from './Assertion';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { NamedIndividual } from './NamedIndividual';
import { ObjectAllValuesFrom } from './ObjectAllValuesFrom';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectAllValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectProperty op1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let op1 = new ObjectProperty(o1, 'op1');
                describe(
                    `Given o1 declares individuals i1, i2, i3 and Class c1 with members i1 and i3:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        let i3 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c1, i3);
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'ObjectAllValuesFrom', 'op1', 'c1', 'i1', 'i2', 'i3')
                            (evaluator, ObjectAllValuesFrom, op1, c1, i1, i2, i3);
                        new ObjectSomeValuesFrom(op1, c1).Evaluate(evaluator, { op1: [i1] })
                        assert('new ObjectAllValuesFrom(op1, c1).Evaluate(evaluator, { op1: []})');
                        assert('new ObjectAllValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i1 ] })');
                        assert('new ObjectAllValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i3 ] })');
                        assert('new ObjectAllValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i1, i3 ] })');
                        assert('new ObjectAllValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i1, i2 ] }) == false');
                        assert('new ObjectAllValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i2, i3 ] }) == false');
                        assert('new ObjectAllValuesFrom(op1, c1).Evaluate(evaluator, { op1: [ i2 ] }) === false');
                    });
            });
    });
