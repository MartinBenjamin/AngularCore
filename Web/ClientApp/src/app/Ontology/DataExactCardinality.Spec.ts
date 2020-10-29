import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataExactCardinality } from './DataExactCardinality';
import { DataOneOf } from './DataOneOf';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataExactCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataProperty dp1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dp1 = new DataProperty(o1, 'dp1');
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'DataExactCardinality', 'DataOneOf', 'dp1')
                    (evaluator, DataExactCardinality, DataOneOf, dp1);
                assert('new DataExactCardinality(dp1, 0).Evaluate(evaluator, { dp1: [ 1 ] }) === false');
                assert('new DataExactCardinality(dp1, 1).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataExactCardinality(dp1, 2).Evaluate(evaluator, { dp1: [ 1 ] }) === false');
                assert('new DataExactCardinality(dp1, 0, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 0, 1 ] }) === false');
                assert('new DataExactCardinality(dp1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 0, 1 ] })');
                assert('new DataExactCardinality(dp1, 2, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 0, 1 ] }) === false');
                assert('new DataExactCardinality(dp1, 2, new DataOneOf([ 1, 2 ])).Evaluate(evaluator, { dp1: [ 0, 1, 2 ] })');
            });
    });
