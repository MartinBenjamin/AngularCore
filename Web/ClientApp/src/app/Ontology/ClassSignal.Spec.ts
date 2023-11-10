import { } from 'jasmine';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { Class } from './Class';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { EquivalentClasses } from './EquivalentClasses';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
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
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);

                it(
                    'ClassExpressionSignalInterpreter returns same Signal for same class',
                    () => expect(interpreter.ClassExpression(c1)).toBe(interpreter.ClassExpression(c1)));

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
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);

                it(
                    'ClassExpressionSignalInterpreter returns same Signal for same class',
                    () => expect(interpreter.ClassExpression(c1)).toBe(interpreter.ClassExpression(c1)));

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
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);

                it(
                    'ClassExpressionSignalInterpreter returns same Signal for same class',
                    () => expect(interpreter.ClassExpression(c1)).toBe(interpreter.ClassExpression(c1)));

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
