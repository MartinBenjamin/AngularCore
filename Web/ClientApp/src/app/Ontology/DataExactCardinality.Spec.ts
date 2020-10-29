import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataExactCardinality } from './DataExactCardinality';
import { DataOneOf } from './DataOneOf';
import { Ontology } from "./Ontology";
import { DataPropertyExpression, ObjectPropertyExpression } from './Property';

describe(
    'DataExactCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataPropertyExpression dpe1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let ope1 = new ObjectPropertyExpression(o1, 'ope1');
                describe(
                    `Given o1 declares Class c1 with members i1 and i2:`,
                    () =>
                    {
                        let o1 = new Ontology('o1');
                        let dpe1 = new DataPropertyExpression(o1, 'dpe1');
                        let evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'DataExactCardinality', 'DataOneOf', 'dpe1')
                            (evaluator, DataExactCardinality, DataOneOf, dpe1);
                        assert('new DataExactCardinality(dpe1, 0).Evaluate(evaluator, { dpe1: [ 1 ] }) === false');
                        assert('new DataExactCardinality(dpe1, 1).Evaluate(evaluator, { dpe1: [ 1 ] })');
                        assert('new DataExactCardinality(dpe1, 2).Evaluate(evaluator, { dpe1: [ 1 ] }) === false');
                        assert('new DataExactCardinality(dpe1, 0, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 0, 1 ] }) === false');
                        assert('new DataExactCardinality(dpe1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 0, 1 ] })');
                        assert('new DataExactCardinality(dpe1, 2, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 0, 1 ] }) === false');
                        assert('new DataExactCardinality(dpe1, 2, new DataOneOf([ 1, 2 ])).Evaluate(evaluator, { dpe1: [ 0, 1, 2 ] })');
                    });
            });
    });
