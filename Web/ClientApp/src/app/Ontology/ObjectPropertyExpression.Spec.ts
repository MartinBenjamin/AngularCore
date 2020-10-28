import { } from 'jasmine';
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';

function expressionEvaluatorBuilder<TResult>(
    ...argNames
    ): (...args) => (expression: string) => TResult
{
    return function(
        ...args
        )
    {
        return (expression: string) => new Function(
            ...argNames,
            'return ' + expression)(...args);
    }
}

function assertBuilder(
    assertionEvaluator: (assertion: string) => boolean
    ): (assertion: string) => void
{
    return (assertion: string): void => it(
        assertion,
        () => expect(assertionEvaluator(assertion)).toBe(true));
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
                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        let assert = assertBuilder(expressionEvaluatorBuilder<boolean>('o1', 'evaluator', 'ope1')(
                            o1,
                            evaluator,
                            ope1));
                        assert('ope1.Ontology === o1');
                        assert('o1.Axioms.includes(ope1)');
                        it(
                            'Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)',
                            () => expect(Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)).toBe(true));
                        assert('evaluator.ObjectPropertyValues(ope1, {}).length === 0');
                        assert('evaluator.ObjectPropertyValues(ope1, { ope1: null }).length === 0');
                        assert('evaluator.ObjectPropertyValues(ope1, { ope1: 6 }).length === 1');

                        describe(
                            'Given result = evaluator.ObjectPropertyValues(ope1, { ope1: [1, 2] })',
                            () =>
                            {
                                let result = evaluator.ObjectPropertyValues(ope1, { ope1: [1, 2] });
                                let assert = assertBuilder(expressionEvaluatorBuilder<boolean>('result')(result));
                                assert('result.length === 2');
                                assert('!result.includes(0)');
                                assert('result.includes(1)');
                                assert('result.includes(2)');
                                assert('!result.includes(3)');
                            });

                        describe(
                            'Given result = evaluator.ObjectPropertyValues(ope1, { ope1: new Set([1, 2]) })',
                            () =>
                            {
                                let result = evaluator.ObjectPropertyValues(ope1, { ope1: new Set([1, 2]) });
                                let assert = assertBuilder(expressionEvaluatorBuilder<boolean>('result')(result));
                                assert('result.length === 2');
                                assert('!result.includes(0)');
                                assert('result.includes(1)');
                                assert('result.includes(2)');
                                assert('!result.includes(3)');
                            });
                    });
            });
    });
