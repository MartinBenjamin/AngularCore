import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';

describe(
    'ObjectMinCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectPropertyExpression ope1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');
                let ope1: IObjectPropertyExpression = new ObjectPropertyExpression(o1, 'ope1');
                describe(
                    `Given o1 declares Class c1 with members i1 and i2:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c1, i2);
                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        let assert = assertBuilder('evaluator', 'ObjectMinCardinality', 'ope1', 'c1', 'i1', 'i2')
                            (evaluator, ObjectMinCardinality, ope1, c1, i1, i2);
                        assert('new ObjectMinCardinality(ope1, 0).Evaluate(evaluator, { ope1: [] })');
                        assert('new ObjectMinCardinality(ope1, 1).Evaluate(evaluator, { ope1: [] }) === false');
                        assert('new ObjectMinCardinality(ope1, 0).Evaluate(evaluator, { ope1: [ {} ] })');
                        assert('new ObjectMinCardinality(ope1, 1).Evaluate(evaluator, { ope1: [ {} ] })');
                        assert('new ObjectMinCardinality(ope1, 2).Evaluate(evaluator, { ope1: [ {} ] }) === false');
                        assert('new ObjectMinCardinality(ope1, 1, c1).Evaluate(evaluator, { ope1: [ {} ] }) === false');
                        assert('new ObjectMinCardinality(ope1, 1, c1).Evaluate(evaluator, { ope1: [ i1 ] })');
                        assert('new ObjectMinCardinality(ope1, 2, c1).Evaluate(evaluator, { ope1: [ i1 ] }) === false');
                        assert('new ObjectMinCardinality(ope1, 2, c1).Evaluate(evaluator, { ope1: [ i1, {} ] }) === false');
                        assert('new ObjectMinCardinality(ope1, 2, c1).Evaluate(evaluator, { ope1: [ i1, i2 ] })');
                    });
            });
    });
