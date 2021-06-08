import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataHasValue } from './DataHasValue';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataHasValue',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataProperty dp1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dp1 = new DataProperty(o1, 'dp1');
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'DataHasValue', 'dp1')
                    (evaluator, DataHasValue, dp1);
                assert('!new DataHasValue(dp1, 1).Evaluate(evaluator, { })');
                assert('!new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: null })');
                assert('!new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: [] })');
                assert('new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: 1 })');
                assert('!new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: 2 })');
                assert('new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: [ 1, 1 ] })');
                assert('new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: [ 1, 2 ] })');
                assert('!new DataHasValue(dp1, 1).Evaluate(evaluator, { dp1: [ 2, 2 ] })');
            });
    });
