import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMaxCardinality } from './ObjectMaxCardinality';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';

describe(
    'ObjectMaxCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectPropertyExpression ope1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let ope1 = new ObjectPropertyExpression(o1, 'ope1');
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
                        let assert = assertBuilder('evaluator', 'ObjectMaxCardinality', 'ope1', 'c1', 'i1', 'i2')
                            (evaluator, ObjectMaxCardinality, ope1, c1, i1, i2);
                        assert('new ObjectMaxCardinality(ope1, 0).Evaluate(evaluator, { ope1: [] })');
                        assert('new ObjectMaxCardinality(ope1, 0).Evaluate(evaluator, { ope1: [ {} ] }) === false');
                        assert('new ObjectMaxCardinality(ope1, 1).Evaluate(evaluator, { ope1: [] })');
                        assert('new ObjectMaxCardinality(ope1, 1).Evaluate(evaluator, { ope1: [ {} ] })');
                        assert('new ObjectMaxCardinality(ope1, 1).Evaluate(evaluator, { ope1: [ {}, {} ] }) === false');
                        assert('new ObjectMaxCardinality(ope1, 0, c1).Evaluate(evaluator, { ope1: [ {} ] })');
                        assert('new ObjectMaxCardinality(ope1, 0, c1).Evaluate(evaluator, { ope1: [ i1 ] }) === false');
                        assert('new ObjectMaxCardinality(ope1, 1, c1).Evaluate(evaluator, { ope1: [ i1 ] })');
                        assert('new ObjectMaxCardinality(ope1, 1, c1).Evaluate(evaluator, { ope1: [ i1, {} ] })');
                        assert('new ObjectMaxCardinality(ope1, 1, c1).Evaluate(evaluator, { ope1: [ i1, i2 ] }) === false');
                        assert('new ObjectMaxCardinality(ope1, 2, c1).Evaluate(evaluator, { ope1: [ i1, i2 ] })');
                    });
            });
    });
