import { } from 'jasmine';
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';

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
                        it(
                            'ope1.Ontology === o1',
                            () => expect(ope1.Ontology).toBe(o1));
                        it(
                            'o1.Axioms.includes(ope1)',
                            () => expect(o1.Axioms.includes(ope1)).toBe(true));
                        it(
                            'Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)',
                            () => expect(Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)).toBe(true));

                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        it(
                            'Array.from(evaluator.ObjectPropertyValues(ope1, {})).length === 0',
                            () => expect(Array.from(evaluator.ObjectPropertyValues(ope1, {})).length).toBe(0));
                        it(
                            'Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: null })).length === 0',
                            () => expect(Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: null })).length).toBe(0));
                        it(
                            'Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: 6 })).length === 1',
                            () => expect(Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: 6 })).length).toBe(1));
                        it(
                            'Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: [1, 2] })).length === 2',
                            () => expect(Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: [1, 2] })).length).toBe(2));
                        it(
                            'Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: new Set([1, 2]) })).length === 2',
                            () => expect(Array.from(evaluator.ObjectPropertyValues(ope1, { ope1: new Set([1, 2]) })).length).toBe(2));

                        //describe(
                        //    'Given an object o with no key ope1 set to null:',
                        //    () =>
                        //    {
                        //        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        //        it(
                        //            'Array.from(evaluator.ObjectPropertyValues(ope1, {})).length === 0',
                        //            () => expect(Array.from(evaluator.ObjectPropertyValues(ope1, {})).length).toBe(0));
                        //    });
                    });
            });
    });
