import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataAllValuesFrom } from './DataAllValuesFrom';
import { DataOneOf } from './DataOneOf';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataAllValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataProperty dp1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dp1 = new DataProperty(o1, 'dp1');
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'DataAllValuesFrom', 'DataOneOf', 'dp1')
                    (evaluator, DataAllValuesFrom, DataOneOf, dp1);
                assert('new DataAllValuesFrom(dp1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [] })');
                assert('new DataAllValuesFrom(dp1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1 ] })');
                assert('!new DataAllValuesFrom(dp1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dp1: [ 1, 2 ] })');
            });
    });
