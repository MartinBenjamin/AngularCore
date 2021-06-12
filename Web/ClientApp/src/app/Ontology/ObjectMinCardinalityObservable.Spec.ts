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

                describe(
                    'Given an individual i:',
                    () =>
                    {
                        let i = 1;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i]));
                        it(
                            'i ∈ (c1)C',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i)).toBe(true);
                            });
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
                    'Given an individual i:',
                    () =>
                    {
                        let i = 1;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i]));
                        it(
                            '¬(i ∈ (c1)C)',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i)).toBe(false);
                            });
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(i1, 12)}:',
                    () =>
                    {
                        let i1 = 1;
                        let i2 = 2;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i1]));
                        classifier[1].get('op1').next([[i1, i2]]);
                        it(
                            'i1 ∈ (c1)C',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i1)).toBe(true);
                            });

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
                    'Given an individual i:',
                    () =>
                    {
                        let i = 1;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i]));
                        it(
                            '¬(i ∈ (c1)C)',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i)).toBe(false);
                            });
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(i1, 12)}:',
                    () =>
                    {
                        let i1 = 1;
                        let i2 = 2;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i1]));
                        classifier[1].get('op1').next([[i1, i2]]);
                        it(
                            '¬(i1 ∈ (c1)C)',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i1)).toBe(false);
                            });

                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(i1, 12), (i1, i3)}:',
                    () =>
                    {
                        let i1 = 1;
                        let i2 = 2;
                        let i3 = 3;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i1]));
                        classifier[1].get('op1').next([[i1, i2], [i1, i3]]);
                        it(
                            'i1 ∈ (c1)C',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i1)).toBe(true);
                            });

                        subscription.unsubscribe();
                    });

                //describe(
                //    'Given an individual i1 with relations (i1, 12) and (i1, i2):',
                //    () =>
                //    {
                //        let i1 = 1;
                //        let i2 = 2;
                //        let c1Members: Set<any> = null;
                //        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                //        classifier[0].next(new Set<any>([i1]));
                //        classifier[1].get('op1').next([[i1, i2], [i1, i2]]);
                //        it(
                //            'i1 is not a member of c1',
                //            () =>
                //            {
                //                expect(c1Members).not.toBeNull();
                //                expect(c1Members.has(i1)).toBe(false);
                //            });

                //        subscription.unsubscribe();
                //    });
            });

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1), NamedIndividual(i2)\
 and EquivalentClasses(c1 ObjectMinCardinality(1 op1 ObjectOneOf([i2]))):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i2 = new NamedIndividual(o1, 'i2');
                new DataPropertyAssertion(o1, new DataProperty(o1, 'Id'), i2, 2);
                const c1 = new Class(o1, 'c1');
                const op1 = new ObjectProperty(o1, 'op1');
                new EquivalentClasses(o1, [c1, new ObjectMinCardinality(op1, 1, new ObjectOneOf([i2]))]);
                const classifier = generator.Generate(o1);

                describe(
                    'Given (op1)OP = {(i1, i3)}:',
                    () =>
                    {
                        let i1 = 1;
                        let i3 = 3;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i1]));
                        classifier[1].get('op1').next([[i1, i3]]);
                        it(
                            '¬(i1 ∈ (c1)C)',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i1)).toBe(false);
                            });
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(i1, 12)}:',
                    () =>
                    {
                        let i1 = 1;
                        let i2 = 2;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i1]));
                        classifier[1].get('op1').next([[i1, i2]]);
                        it(
                            'i1 ∈ (c1)C',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i1)).toBe(true);
                            });

                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(i1, 12), (i1, i3)}:',
                    () =>
                    {
                        let i1 = 1;
                        let i2 = 2;
                        let i3 = 3;
                        let c1Members: Set<any> = null;
                        let subscription = classifier[2].get(c1).subscribe(m => c1Members = m);
                        classifier[0].next(new Set<any>([i1]));
                        classifier[1].get('op1').next([[i1, i2], [i1, i3]]);
                        it(
                            'i1 ∈ (c1)C',
                            () =>
                            {
                                expect(c1Members).not.toBeNull();
                                expect(c1Members.has(i1)).toBe(true);
                            });

                        subscription.unsubscribe();
                    });
            });
    });
