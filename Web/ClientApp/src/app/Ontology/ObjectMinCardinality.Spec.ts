import { } from 'jasmine';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';

function assertBuilder(
    evaluator,
    objectMinCardinality,
    ope1,
    c1,
    i1,
    i2
    ): (assertion: string) => void
{
    return (
        assertion: string
    ): void => it(
        assertion,
        () => expect(new Function(
            'evaluator',
            'ObjectMinCardinality',
            'ope1',
            'c1',
            'c2',
            'i1',
            'i2',
            'return ' + assertion)(
                evaluator,
                objectMinCardinality,
                ope1,
                c1,
                i1,
                i2)).toBe(true));
}

describe(
    'ObjectMinCardinality',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectPropertyExpression ope1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');
                let ope1: IObjectPropertyExpression = new ObjectPropertyExpression(o1, 'ope1');
                describe(
                    `Given o1 declares Class c1 with members i1 and i2:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c1, i2);
                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        let assert = assertBuilder(evaluator, ObjectMinCardinality, ope1, c1, i1, i2);
                        new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [i1] })
                        assert('new ObjectMinCardinality(ope1, 0).Evaluate(evaluator, { ope1: [] })');
                        //assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1 ] })');
                        //assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1, i2 ] })');
                        //assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i2 ] }) === false');
                    });
            });
    });
