import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataMinCardinality } from './DataMinCardinality';
import { DataOneOf } from './DataOneOf';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataMinCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataProperty dp1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dp1 = new DataProperty(o1, 'dp1');
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'DataMinCardinality', 'DataOneOf', 'dp1')
                    (evaluator, DataMinCardinality, DataOneOf, dp1);
                assert('new DataMinCardinality(dp1, 0).Evaluate(evaluator, { dp1: [] })');
                assert('new DataMinCardinality(dp1, 1).Evaluate(evaluator, { dp1: [] }) === false');
                assert('new DataMinCardinality(dp1, 0).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataMinCardinality(dp1, 1).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataMinCardinality(dp1, 2).Evaluate(evaluator, { dp1: [ 1 ] }) === false');
                assert('new DataMinCardinality(dp1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 0 ] }) === false');
                assert('new DataMinCardinality(dp1, 1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataMinCardinality(dp1, 2, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1 ] }) === false');
                assert('new DataMinCardinality(dp1, 2, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1, 2 ] }) === false');
                assert('new DataMinCardinality(dp1, 2, new DataOneOf([ 1, 2 ])).Evaluate(evaluator, { dp1: [ 1, 2 ] })');
            });
    });
