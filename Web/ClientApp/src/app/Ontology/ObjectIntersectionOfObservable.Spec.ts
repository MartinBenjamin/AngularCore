import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ObjectIntersectionOf } from './ClassExpression';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { EavStore, IEavStore, ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";

describe(
    'ObjectIntersectionOf( CE1 ... CEn ) ((CE1)C ∩ ... ∩ (CEn)C)',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms NamedIndividual(i1), NamedIndividual(i2) and NamedIndividual(i3):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                const i3 = new NamedIndividual(o1, 'i3');
                const ce1 = new ObjectOneOf([i1, i3]);
                const ce2 = new ObjectOneOf([i2, i3]);
                const ce3 = new ObjectIntersectionOf([ce1, ce2]);
                const store: IEavStore = new EavStore();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);
                const i3Interpretation = generator.InterpretIndividual(i3);

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
                    `(i1)I ∈ (${classExpressionWriter.Write(ce1)})C`,
                    () => expect(elements(ce1).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce2)})C)`,
                    () => expect(elements(ce2).has(i1Interpretation)).toBe(false));
                it(
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce3)})C)`,
                    () => expect(elements(ce3).has(i1Interpretation)).toBe(false));

                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce1)})C)`,
                    () => expect(elements(ce1).has(i2Interpretation)).toBe(false));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce2)})C`,
                    () => expect(elements(ce2).has(i2Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce3)})C)`,
                    () => expect(elements(ce3).has(i2Interpretation)).toBe(false));

                it(
                    `(i3)I ∈ (${classExpressionWriter.Write(ce1)})C`,
                    () => expect(elements(ce1).has(i3Interpretation)).toBe(true));
                it(
                    `(i3)I ∈ (${classExpressionWriter.Write(ce2)})C`,
                    () => expect(elements(ce2).has(i3Interpretation)).toBe(true));
                it(
                    `(i3)I ∈ (${classExpressionWriter.Write(ce3)})C`,
                    () => expect(elements(ce3).has(i3Interpretation)).toBe(true));
            });
    });
