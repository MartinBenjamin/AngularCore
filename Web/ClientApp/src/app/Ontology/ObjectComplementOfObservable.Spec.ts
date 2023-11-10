import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ObjectComplementOf } from './ClassExpression';
import { ClassExpressionObservableInterpreter } from './ClassExpressionObservableInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";

describe(
    'ObjectComplementOf( CE ) (ΔI \ (CE)C)',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms NamedIndividual(i1) and NamedIndividual(i2):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                const ce1 = new ObjectOneOf([i1]);
                const ce2 = new ObjectOneOf([i2]);
                const ce1Complement = new ObjectComplementOf(ce1);
                const ce2Complement = new ObjectComplementOf(ce2);
                const store: IEavStore = new EavStore();
                const generator = new ClassExpressionObservableInterpreter(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);

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
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce1Complement)})C)`,
                    () => expect(elements(ce1Complement).has(i1Interpretation)).toBe(false));
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(ce2Complement)})C`,
                    () => expect(elements(ce2Complement).has(i1Interpretation)).toBe(true));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce2)})C`,
                    () => expect(elements(ce2).has(i2Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce1)})C)`,
                    () => expect(elements(ce1).has(i2Interpretation)).toBe(false));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce2Complement)})C)`,
                    () => expect(elements(ce2Complement).has(i2Interpretation)).toBe(false));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce1Complement)})C`,
                    () => expect(elements(ce1Complement).has(i2Interpretation)).toBe(true));
        });
    });
