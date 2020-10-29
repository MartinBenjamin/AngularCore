import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataMaxCardinality } from './DataMaxCardinality';
import { DataOneOf } from './DataOneOf';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataMaxCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataProperty dp1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dp1 = new DataProperty(o1, 'dp1');
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'DataMaxCardinality', 'DataOneOf', 'dp1')
                    (evaluator, DataMaxCardinality, DataOneOf, dp1);
                assert('new DataMaxCardinality(dp1, 0).Evaluate(evaluator, { dp1: [] })');
                assert('new DataMaxCardinality(dp1, 0).Evaluate(evaluator, { dp1: [ 1 ] }) === false');
                assert('new DataMaxCardinality(dp1, 1).Evaluate(evaluator, { dp1: [] })');
                assert('new DataMaxCardinality(dp1, 1).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataMaxCardinality(dp1, 1).Evaluate(evaluator, { dp1: [ 1, 2 ] }) === false');
                assert('new DataMaxCardinality(dp1, 0, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 0 ] })');
                assert('new DataMaxCardinality(dp1, 0, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1 ] }) === false');
                assert('new DataMaxCardinality(dp1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataMaxCardinality(dp1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1, 2 ] })');
                assert('new DataMaxCardinality(dp1, 1, new DataOneOf([ 1, 2 ])).Evaluate(evaluator, { dp1: [ 1, 2 ] }) === false');
                assert('new DataMaxCardinality(dp1, 2, new DataOneOf([ 1, 2 ])).Evaluate(evaluator, { dp1: [ 1, 2 ] })');
            });
    });
