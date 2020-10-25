import { } from 'jasmine';
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';

function assertBuilder(
    o1,
    evaluator,
    ope1
    ): (assertion: string) => void
{
    return (
        assertion: string
    ): void => it(
        assertion,
        () => expect(new Function(
            'o1',
            'evaluator',
            'ope1',
            'return ' + assertion)(
                o1,
                evaluator,
                ope1)).toBe(true));
}

describe(
    'ObjectPropertyExpression',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');

                describe(
                    'Given o1 declares ObjectPropertyExpression ope1:',
                    () =>
                    {
                        let ope1: IObjectPropertyExpression = new ObjectPropertyExpression(o1, 'ope1');
                        let assert = assertBuilder(
                            o1,
                            new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>()),
                            ope1);
                        assert('ope1.Ontology === o1');
                        assert('o1.Axioms.includes(ope1)');
                        it(
                            'Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)',
                            () => expect(Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)).toBe(true));
                        assert('Array.from(evaluator.ObjectPropertyValues(ope1, {})).length === 0');
                        assert('Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: null })).length === 0');
                        assert('Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: 6 })).length === 1');
                        assert('Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: [1, 2] })).length === 2');
                        assert('Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: new Set([1, 2]) })).length === 2');
                    });
            });
    });
