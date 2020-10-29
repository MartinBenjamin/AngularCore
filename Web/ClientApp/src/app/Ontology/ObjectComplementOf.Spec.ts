import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from "./Class";
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectComplementOf } from './ObjectComplementOf';
import { Ontology } from "./Ontology";

describe(
    'ObjectComplementOf',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1 = new Ontology('o1');
                describe(
                    `Given o1 declares Class c1 with member i1 and Class c2 with member i2:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let c2 = new Class(o1, 'c2');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c2, i2);
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'ObjectComplementOf', 'c1', 'c2', 'i1', 'i2')
                            (evaluator, ObjectComplementOf, c1, c2, i1, i2);
                        assert('c1.Evaluate(evaluator, i1)');
                        assert('new ObjectComplementOf(c1).Evaluate(evaluator, i1) === false');

                        assert('c1.Evaluate(evaluator, i2) === false');
                        assert('new ObjectComplementOf(c1).Evaluate(evaluator, i2)');

                        assert('c2.Evaluate(evaluator, i1) === false');
                        assert('new ObjectComplementOf(c2).Evaluate(evaluator, i1)');

                        assert('c2.Evaluate(evaluator, i2)');
                        assert('new ObjectComplementOf(c2).Evaluate(evaluator, i2) === false');
                    });
            });
    });
