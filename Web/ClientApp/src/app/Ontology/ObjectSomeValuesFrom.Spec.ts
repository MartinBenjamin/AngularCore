import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';

describe(
    'ObjectSomeValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectPropertyExpression ope1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let ope1 = new ObjectPropertyExpression(o1, 'ope1');
                describe(
                    `Given o1 declares individuals i1, i2 and Class c1 with member i1:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        let assert = assertBuilder('evaluator', 'ObjectSomeValuesFrom', 'ope1', 'c1', 'i1', 'i2')
                            (evaluator, ObjectSomeValuesFrom, ope1, c1, i1, i2);
                        new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, {ope1: [ i1 ]})
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [] }) === false');
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1 ] })');
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1, i2 ] })');
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i2 ] }) === false');
                    });
            });
    });
