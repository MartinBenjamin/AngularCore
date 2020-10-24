import { } from 'jasmine';
import { Class } from "./Class";
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { IOntology } from "./IOntology";
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";

describe(
    'Class',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');
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
                        it(
                            'c1.Evaluate(evaluator, i1)',
                            () => expect(c1.Evaluate(evaluator, i1)).toBe(true));
                        it(
                            'c1.Evaluate(evaluator, i2) === false',
                            () => expect(c1.Evaluate(evaluator, i2)).toBe(false));
                        it(
                            'c2.Evaluate(evaluator, i1) === false',
                            () => expect(c2.Evaluate(evaluator, i1)).toBe(false));
                        it(
                            'c2.Evaluate(evaluator, i2)',
                            () => expect(c2.Evaluate(evaluator, i2)).toBe(true));
                    });
            });
    });
