import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataMaxCardinality } from './DataMaxCardinality';
import { DataOneOf } from './DataOneOf';
import { Ontology } from "./Ontology";
import { DataPropertyExpression } from './Property';

describe(
    'DataMaxCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataPropertyExpression dpe1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dpe1 = new DataPropertyExpression(o1, 'dpe1');
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'DataMaxCardinality', 'DataOneOf', 'dpe1')
                    (evaluator, DataMaxCardinality, DataOneOf, dpe1);
                assert('new DataMaxCardinality(dpe1, 0).Evaluate(evaluator, { dpe1: [] })');
                assert('new DataMaxCardinality(dpe1, 0).Evaluate(evaluator, { dpe1: [ 1 ] }) === false');
                assert('new DataMaxCardinality(dpe1, 1).Evaluate(evaluator, { dpe1: [] })');
                assert('new DataMaxCardinality(dpe1, 1).Evaluate(evaluator, { dpe1: [ 1 ] })');
                assert('new DataMaxCardinality(dpe1, 1).Evaluate(evaluator, { dpe1: [ 1, 2 ] }) === false');
                assert('new DataMaxCardinality(dpe1, 0, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 0 ] })');
                assert('new DataMaxCardinality(dpe1, 0, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 1 ] }) === false');
                assert('new DataMaxCardinality(dpe1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 1 ] })');
                assert('new DataMaxCardinality(dpe1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 1, 2 ] })');
                assert('new DataMaxCardinality(dpe1, 1, new DataOneOf([ 1, 2 ])).Evaluate(evaluator, { dpe1: [ 1, 2 ] }) === false');
                assert('new DataMaxCardinality(dpe1, 2, new DataOneOf([ 1, 2 ])).Evaluate(evaluator, { dpe1: [ 1, 2 ] })');
            });
    });
