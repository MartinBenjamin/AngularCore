import { } from 'jasmine';
import { Signal } from '../Signal';
import { ObjectComplementOf } from './ClassExpression';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { EavStore } from './EavStore';
import { IClassExpression } from './IClassExpression';
import { IEavStore } from './IEavStore';
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
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);

                function elements(
                    ce: IClassExpression
                    ): Set<any>
                {
                    let signal: Signal<Set<any>>;
                    let elements: Set<any> = null;
                    try
                    {
                        signal = store.SignalScheduler.AddSignal(
                            m => elements = m,
                            [interpreter.ClassExpression(ce)]);
                        return elements;
                    }
                    finally
                    {
                        store.SignalScheduler.RemoveSignal(signal);
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
