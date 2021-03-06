import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectExactCardinality } from './ObjectExactCardinality';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectExactCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectProperty op1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let op1 = new ObjectProperty(o1, 'op1');
                describe(
                    `Given o1 declares Class c1 with members i1 and i2:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c1, i2);
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'ObjectExactCardinality', 'op1', 'c1', 'i1', 'i2')
                            (evaluator, ObjectExactCardinality, op1, c1, i1, i2);
                        assert('new ObjectExactCardinality(op1, 0).Evaluate(evaluator, { op1: [ {} ] }) === false');
                        assert('new ObjectExactCardinality(op1, 1).Evaluate(evaluator, { op1: [ {} ] })');
                        assert('new ObjectExactCardinality(op1, 2).Evaluate(evaluator, { op1: [ {} ] }) === false');
                        assert('new ObjectExactCardinality(op1, 0, c1).Evaluate(evaluator, { op1: [ {}, i1 ] }) === false');
                        assert('new ObjectExactCardinality(op1, 1, c1).Evaluate(evaluator, { op1: [ {}, i1 ] })');
                        assert('new ObjectExactCardinality(op1, 2, c1).Evaluate(evaluator, { op1: [ {}, i1 ] }) === false');
                        assert('new ObjectExactCardinality(op1, 2, c1).Evaluate(evaluator, { op1: [ {}, i1, i2 ] })');
                    });
            });
    });
