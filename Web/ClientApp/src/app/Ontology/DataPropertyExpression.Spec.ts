import { } from 'jasmine';
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { DataPropertyExpression } from './Property';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';

function assertBuilder(
    o1,
    evaluator,
    dpe1
    ): (assertion: string) => void
{
    return (
        assertion: string
    ): void => it(
        assertion,
        () => expect(new Function(
            'o1',
            'evaluator',
            'dpe1',
            'return ' + assertion)(
                o1,
                evaluator,
                dpe1)).toBe(true));
}

describe(
    'DataPropertyExpression',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');

                describe(
                    'Given o1 declares DataPropertyExpression dpe1:',
                    () =>
                    {
                        let dpe1: IDataPropertyExpression = new DataPropertyExpression(o1, 'dpe1');
                        let assert = assertBuilder(
                            o1,
                            new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>()),
                            dpe1);
                        assert('dpe1.Ontology === o1');
                        assert('o1.Axioms.includes(dpe1)');
                        it(
                            'Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dpe1)',
                            () => expect(Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dpe1)).toBe(true));
                        assert('Array.isArray(evaluator.DataPropertyValues(dpe1, {}))');
                        assert('evaluator.DataPropertyValues(dpe1, {}).length === 0');
                        assert('evaluator.DataPropertyValues(dpe1, { dpe1: null }).length === 0');
                        assert('evaluator.DataPropertyValues(dpe1, { dpe1: 6 }).length === 1');
                        assert('evaluator.DataPropertyValues(dpe1, { dpe1: [1, 2] }).length === 2');
                        assert('evaluator.DataPropertyValues(dpe1, { dpe1: new Set([1, 2]) }).length === 2');
                    });
            });
    });
