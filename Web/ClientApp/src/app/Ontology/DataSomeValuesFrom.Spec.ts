import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataOneOf } from './DataOneOf';
import { DataSomeValuesFrom } from './DataSomeValuesFrom';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataSomeValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataProperty dp1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dp1 = new DataProperty(o1, 'dp1');
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'DataSomeValuesFrom', 'DataOneOf', 'dp1')
                    (evaluator, DataSomeValuesFrom, DataOneOf, dp1);
                assert('!new DataSomeValuesFrom(dp1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [] })');
                assert('new DataSomeValuesFrom(dp1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('new DataSomeValuesFrom(dp1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1, 2 ] })');
                assert('!new DataSomeValuesFrom(dp1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 2 ] })');
            });
    });
