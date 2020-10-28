import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataOneOf } from './DataOneOf';
import { DataSomeValuesFrom } from './DataSomeValuesFrom';
import { IClassExpression } from './IClassExpression';
import { Ontology } from "./Ontology";
import { DataPropertyExpression } from './Property';

describe(
    'DataSomeValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataPropertyExpression dpe1:',
            () =>
            {
                let o1 = new Ontology('o1');
                let dpe1 = new DataPropertyExpression(o1, 'dpe1');
                let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                let assert = assertBuilder('evaluator', 'DataSomeValuesFrom', 'DataOneOf', 'dpe1')
                    (evaluator, DataSomeValuesFrom, DataOneOf, dpe1);
                assert('!new DataSomeValuesFrom(dpe1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [] })');
                assert('new DataSomeValuesFrom(dpe1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 1 ] })');
                assert('new DataSomeValuesFrom(dpe1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 1, 2 ] })');
                assert('!new DataSomeValuesFrom(dpe1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 2 ] })');
            });
    });
