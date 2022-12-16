import { } from 'jasmine';
import { Signal } from '../Signal';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectAllValuesFrom } from './ObjectAllValuesFrom';
import { ObjectOneOf } from './ObjectOneOf';
import { EavStore, IEavStore } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectAllValuesFrom( OPE CE ) ({ x | ∀ y : ( x, y ) ∈ (OPE)OP implies y ∈ (CE)C })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms NamedIndividual(i1), NamedIndividual(i2) and NamedIndividual(i3):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                const i3 = new NamedIndividual(o1, 'i3');
                const ce = new ObjectAllValuesFrom(op1, new ObjectOneOf([i1, i2]));
                const store: IEavStore = new EavStore();
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);
                const i3Interpretation = interpreter.InterpretIndividual(i3);

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

                describe(
                    'Given (op1)OP = {}',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i1)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i2)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i2Interpretation);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i1), (x, i2)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation);
                        store.Assert(x, op1.LocalName, i2Interpretation);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i1), (x, i2), (x, i3)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation);
                        store.Assert(x, op1.LocalName, i2Interpretation);
                        store.Assert(x, op1.LocalName, i3Interpretation);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });
            });
    });
