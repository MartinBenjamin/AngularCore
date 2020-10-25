import { } from 'jasmine';
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { Class } from './Class';
import { NamedIndividual, ClassAssertion } from './NamedIndividual';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';

function assertBuilder(
    evaluator,
    objectSomeValuesFrom,
    ope1,
    c1,
    c2,
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
            'ObjectSomeValuesFrom',
            'ope1',
            'c1',
            'c2',
            'i1',
            'i2',
            'return ' + assertion)(
                evaluator,
                objectSomeValuesFrom,
                ope1,
                c1,
                c2,
                i1,
                i2)).toBe(true));
}

describe(
    'ObjectSomeValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectPropertyExpression ope1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');
                let ope1: IObjectPropertyExpression = new ObjectPropertyExpression(o1, 'ope1');
                describe(
                    `Given o1 declares Class c1 with member i1 and Class c2 with member i2:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let c2 = new Class(o1, 'c2');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c2, i2);
                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        let assert = assertBuilder(evaluator, ObjectSomeValuesFrom, ope1, c1, c2, i1, i2);
                        new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, {ope1: [ i1 ]})
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: []}) === false');
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1 ] })');
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1, i2 ] })');
                        assert('new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i2 ] }) === false');
                    });
            });
    });
