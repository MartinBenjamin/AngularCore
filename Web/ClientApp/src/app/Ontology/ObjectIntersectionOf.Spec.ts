import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectIntersectionOf } from './ObjectIntersectionOf';
import { Ontology } from "./Ontology";

describe(
    'ObjectIntersectionOf',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1 = new Ontology('o1');
                describe(
                    `Given o1 declares Class c1 with members i1 and i2 and Class c2 with members i2 and i3:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let c2 = new Class(o1, 'c2');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        let i3 = new NamedIndividual(o1, 'i3');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c1, i2);
                        new ClassAssertion(o1, c2, i2);
                        new ClassAssertion(o1, c2, i3);
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'ObjectIntersectionOf', 'c1', 'c2', 'i1', 'i2', 'i3')
                            (evaluator, ObjectIntersectionOf, c1, c2, i1, i2, i3);
                        assert('c1.Evaluate(evaluator, i1)');
                        assert('c1.Evaluate(evaluator, i2)');
                        assert('c1.Evaluate(evaluator, i3) === false');
                        assert('c2.Evaluate(evaluator, i1) === false');
                        assert('c2.Evaluate(evaluator, i2)');
                        assert('c2.Evaluate(evaluator, i3)');
                        assert('new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i1) === false');
                        assert('new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i2)');
                        assert('new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i3) === false');
                    });
            });
    });
