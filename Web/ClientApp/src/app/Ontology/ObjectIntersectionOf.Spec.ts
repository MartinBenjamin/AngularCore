import { } from 'jasmine';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { IOntology } from "./IOntology";
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectIntersectionOf } from './ObjectIntersectionOf';
import { ObjectUnionOf } from './ObjectUnionOf';
import { Ontology } from "./Ontology";

describe(
    'ObjectIntersectionOf/ObjectUnionOf',
    () =>
    {
        describe(
            `Given Class c1 with members i1 and i2 and Class c2 with members i2 and i3:`,
            () =>
            {
                let o1: IOntology = new Ontology('o1');
                let c1 = new Class(o1, 'c1');
                let c2 = new Class(o1, 'c1');
                let i1 = new NamedIndividual(o1, 'i1');
                let i2 = new NamedIndividual(o1, 'i2');
                let i3 = new NamedIndividual(o1, 'i3');
                new ClassAssertion(o1, c1, i1);
                new ClassAssertion(o1, c1, i2);
                new ClassAssertion(o1, c2, i2);
                new ClassAssertion(o1, c2, i3);
                let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                it(
                    'c1.Evaluate(evaluator, i1)',
                    () => expect(c1.Evaluate(evaluator, i1)).toBe(true));
                it(
                    'c1.Evaluate(evaluator, i2)',
                    () => expect(c1.Evaluate(evaluator, i1)).toBe(true));
                it(
                    'c1.Evaluate(evaluator, i3) === false',
                    () => expect(c1.Evaluate(evaluator, i3)).toBe(false));
                it(
                    'c2.Evaluate(evaluator, i1) === false',
                    () => expect(c1.Evaluate(evaluator, i1)).toBe(true));
                it(
                    'c2.Evaluate(evaluator, i2)',
                    () => expect(c1.Evaluate(evaluator, i1)).toBe(true));
                it(
                    'c2.Evaluate(evaluator, i3)',
                    () => expect(c1.Evaluate(evaluator, i3)).toBe(false));
                it(
                    'new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i1) === false',
                    () => expect(new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i1)).toBe(false));
                it(
                    'new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i2)',
                    () => expect(new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i2)).toBe(true));
                it(
                    'new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i3) === false',
                    () => expect(new ObjectIntersectionOf([c1, c2]).Evaluate(evaluator, i3)).toBe(false));
                it(
                    'new ObjectUnionOf([c1, c2]).Evaluate(evaluator, i1)',
                    () => expect(new ObjectUnionOf([c1, c2]).Evaluate(evaluator, i1)).toBe(true));
                it(
                    'new ObjectUnionOf([c1, c2]).Evaluate(evaluator, i2)',
                    () => expect(new ObjectUnionOf([c1, c2]).Evaluate(evaluator, i2)).toBe(true));
                it(
                    'new ObjectUnionOf([c1, c2]).Evaluate(evaluator, i3)',
                    () => expect(new ObjectUnionOf([c1, c2]).Evaluate(evaluator, i3)).toBe(true));

            });
    });
