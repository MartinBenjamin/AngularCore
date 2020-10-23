import { } from 'jasmine';
import { IOntology } from "./IOntology";
import { IDataPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { DataPropertyExpression } from './Property';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';

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
                        it(
                            'dpe1.Ontology === o1',
                            () => expect(dpe1.Ontology).toBe(o1));
                        it(
                            'o1.Axioms.includes(dpe1)',
                            () => expect(o1.Axioms.includes(dpe1)).toBe(true));
                        it(
                            'Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dpe1)',
                            () => expect(Array.from(o1.Get<IDataPropertyExpression>(o1.IsAxiom.IDataPropertyExpression)).includes(dpe1)).toBe(true));

                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        it(
                            'Array.from(evaluator.DataPropertyValues(dpe1, {})).length === 0',
                            () => expect(Array.from(evaluator.DataPropertyValues(dpe1, {})).length).toBe(0));
                        it(
                            'Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: null })).length === 0',
                            () => expect(Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: null })).length).toBe(0));
                        it(
                            'Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: 6 })).length === 1',
                            () => expect(Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: 6 })).length).toBe(1));
                        it(
                            'Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: [1, 2] })).length === 2',
                            () => expect(Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: [1, 2] })).length).toBe(2));
                        it(
                            'Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: new Set([1, 2]) })).length === 2',
                            () => expect(Array.from(evaluator.DataPropertyValues(dpe1, { dpe1: new Set([1, 2]) })).length).toBe(2));
                    });
            });
    });
