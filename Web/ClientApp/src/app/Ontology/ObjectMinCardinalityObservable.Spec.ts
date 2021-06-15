import { } from 'jasmine';
import { Class } from './Class';
import { ClassifierGenerator } from './ClassifierGenerator';
import { EquivalentClasses } from './EquivalentClasses';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";
import { DataProperty, ObjectProperty } from './Property';

describe(
    'ObjectMinCardinality(n OPE) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } ≥ n })',
    () =>
    {
        const generator = new ClassifierGenerator();

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1) and EquivalentClasses(c1 ObjectMinCardinality(0 op1)):',
            () =>
            {
                const o1 = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const op1 = new ObjectProperty(o1, 'op1');
                new EquivalentClasses(o1, [c1, new ObjectMinCardinality(op1, 0)]);
                const classifier = generator.Generate(o1);

                it(
                    '(c1)C = ΔI',
                    () => expect(classifier[2].get(c1)).toBe(classifier[0]));

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = 1;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        it(
                            'x ∈ (c1)C',
                            () => expect(c1Members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1) and EquivalentClasses(c1 ObjectMinCardinality(1 op1)):',
            () =>
            {
                const o1 = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const op1 = new ObjectProperty(o1, 'op1');
                new EquivalentClasses(o1, [c1, new ObjectMinCardinality(op1, 1)]);
                const classifier = generator.Generate(o1);

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = 1;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        it(
                            '¬(x ∈ (c1)C)',
                            () => expect(c1Members.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        classifier[1].get('op1').next([[x, y]]);
                        it(
                            'x ∈ (c1)C',
                            () => expect(c1Members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1) and EquivalentClasses(c1 ObjectMinCardinality(2 op1)):',
            () =>
            {
                const o1 = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const op1 = new ObjectProperty(o1, 'op1');
                new EquivalentClasses(o1, [c1, new ObjectMinCardinality(op1, 2)]);
                const classifier = generator.Generate(o1);

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = 1;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        it(
                            '¬(x ∈ (c1)C)',
                            () => expect(c1Members.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        classifier[1].get('op1').next([[x, y]]);
                        it(
                            '¬(x ∈ (c1)C)',
                            () => expect(c1Members.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, y), (x, z)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        const z = 3;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        classifier[1].get('op1').next([[x, y], [x, z]]);
                        it(
                            'x ∈ (c1)C',
                            () => expect(c1Members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });
    });
    
describe(
    'ObjectMinCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } ≥ n })',
    () =>
    {
        const generator = new ClassifierGenerator();

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1), NamedIndividual(i)\
 and EquivalentClasses(c1 ObjectMinCardinality(1 op1 ObjectOneOf([i]))):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i = new NamedIndividual(o1, 'i');
                const iInterpretation = 10;
                new DataPropertyAssertion(o1, new DataProperty(o1, 'Id'), i, iInterpretation);
                const c1 = new Class(o1, 'c1');
                const op1 = new ObjectProperty(o1, 'op1');
                new EquivalentClasses(o1, [c1, new ObjectMinCardinality(op1, 1, new ObjectOneOf([i]))]);
                const classifier = generator.Generate(o1);

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        classifier[1].get('op1').next([[x, y]]);
                        it(
                            '¬(x ∈ (c1)C)',
                            () => expect(c1Members.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I)}:',
                    () =>
                    {
                        const x = 1;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        classifier[1].get('op1').next([[x, iInterpretation]]);
                        it(
                            'x ∈ (c1)C',
                            () => expect(c1Members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I), (x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let   c1Members: Set<any> = null;
                        const subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([x]));
                        classifier[1].get('op1').next([[x, iInterpretation], [x, y]]);
                        it(
                            'x ∈ (c1)C',
                            () => expect(c1Members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });
    });
