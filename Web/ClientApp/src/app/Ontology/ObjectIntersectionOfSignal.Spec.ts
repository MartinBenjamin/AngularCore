import { } from 'jasmine';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { ObjectIntersectionOf } from './ClassExpression';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
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
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const i1Interpretation = interpreter.Individual(i1);
                const i2Interpretation = interpreter.Individual(i2);
                const i3Interpretation = interpreter.Individual(i3);

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
