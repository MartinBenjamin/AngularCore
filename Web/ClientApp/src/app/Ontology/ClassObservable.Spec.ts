import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { Class } from './Class';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { EavStore } from './EavStore';
import { EquivalentClasses } from './EquivalentClasses';
import { IClassExpression } from './IClassExpression';
import { IEavStore } from './IEavStore';
import { NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { SubClassOf } from './SubClassOf';



describe(
    'EquivalentClasses( CE1 ... CEn ) ((CEj)C = (CEk)C for each 1 ≤ j ≤ n and each 1 ≤ k ≤ n)',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms Class(c1), Class(c2), NamedIndividual(i1), NamedIndividual(i2), EquivalentClass(c1, c2) and EquivalentClasses(c1, ObjectOneOf(i1)):',
            () =>
            {
                const o1 = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const c2 = new Class(o1, 'c2');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                new EquivalentClasses(o1, [c1, c2]);
                new EquivalentClasses(o1, [c1, new ObjectOneOf([i1])]);
                const store: IEavStore = new EavStore();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);

                it(
                    'ObservableGenerator generates same Observable for same class',
                    () => expect(generator.ClassExpression(c1)).toBe(generator.ClassExpression(c1)))

                function elements(
                    ce: IClassExpression
                    ): Set<any>
                {
                    let subscription: Subscription;
                    try
                    {
                        let elements: Set<any> = null;
                        subscription = generator.ClassExpression(ce).subscribe(m => elements = m);
                        return elements;
                    }
                    finally
                    {
                        subscription.unsubscribe();
                    }
                }

                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                    () => expect(elements(c1).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(c1)})C)`,
                    () => expect(elements(c1).has(i2Interpretation)).toBe(false));
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c2)})C`,
                    () => expect(elements(c2).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(c2)})C)`,
                    () => expect(elements(c2).has(i2Interpretation)).toBe(false));
            });
    });

describe(
    'SubClassOf( CE1 CE2 ) ((CE1)C ⊆ (CE2)C)',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms Class(c1), NamedIndividual(i1), NamedIndividual(i2) and SubClassOf(ObjectOneOf(i1), c1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                new SubClassOf(o1, new ObjectOneOf([i1]), c1);
                const store: IEavStore = new EavStore();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);

                it(
                    'ObservableGenerator generates same Observable for same class',
                    () => expect(generator.ClassExpression(c1)).toBe(generator.ClassExpression(c1)))

                function elements(
                    ce: IClassExpression
                    ): Set<any>
                {
                    let subscription: Subscription;
                    try
                    {
                        let elements: Set<any> = null;
                        subscription = generator.ClassExpression(ce).subscribe(m => elements = m);
                        return elements;
                    }
                    finally
                    {
                        subscription.unsubscribe();
                    }
                }

                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                    () => expect(elements(c1).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(c1)})C)`,
                    () => expect(elements(c1).has(i2Interpretation)).toBe(false));
            });

        describe(
            'Given an Ontology o1 with axioms Class(c1), Class(c2), NamedIndividual(i1), NamedIndividual(i2), EquivalentClass(c1, c2) and SubClassOf(ObjectOneOf(i1), c2):',
            () =>
            {
                const o1 = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const c2 = new Class(o1, 'c2');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                new EquivalentClasses(o1, [c1, c2]);
                new SubClassOf(o1, new ObjectOneOf([i1]), c2);
                const store: IEavStore = new EavStore();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);

                it(
                    'ObservableGenerator generates same Observable for same class',
                    () => expect(generator.ClassExpression(c1)).toBe(generator.ClassExpression(c1)))

                function elements(
                    ce: IClassExpression
                    ): Set<any>
                {
                    let subscription: Subscription;
                    try
                    {
                        let elements: Set<any> = null;
                        subscription = generator.ClassExpression(ce).subscribe(m => elements = m);
                        return elements;
                    }
                    finally
                    {
                        subscription.unsubscribe();
                    }
                }

                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                    () => expect(elements(c1).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(c1)})C)`,
                    () => expect(elements(c1).has(i2Interpretation)).toBe(false));
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c2)})C`,
                    () => expect(elements(c2).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(c2)})C)`,
                    () => expect(elements(c2).has(i2Interpretation)).toBe(false));
            });
    });
