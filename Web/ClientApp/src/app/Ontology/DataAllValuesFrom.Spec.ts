import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { DataAllValuesFrom } from './DataAllValuesFrom';
import { DataOneOf } from './DataOneOf';
import { IClassExpression } from './IClassExpression';
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { DataPropertyExpression } from './Property';

describe(
    'DataAllValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares DataPropertyExpression dpe1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');
                let dpe1: IDataPropertyExpression = new DataPropertyExpression(o1, 'dpe1');
                let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                let assert = assertBuilder('evaluator', 'DataAllValuesFrom', 'DataOneOf', 'dpe1')
                    (evaluator, DataAllValuesFrom, DataOneOf, dpe1);
                assert('new DataAllValuesFrom(dpe1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [] })');
                assert('new DataAllValuesFrom(dpe1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 1 ] })');
                assert('!new DataAllValuesFrom(dpe1, new DataOneOf([ 1 ])).Evaluate(evaluator, { dpe1: [ 1, 2 ] })');
            });
    });
