import { } from 'jasmine';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectMinCardinality(n OPE) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ces = [0, 1, 2].map(cardinality => new ObjectMinCardinality(op1, cardinality));
                const store: IEavStore = new EavStore();
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);

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
                    `(${classExpressionWriter.Write(ces[0])})C = ΔI`,
                    () => expect(interpreter.ClassExpression(ces[0])).toBe(interpreter.ObjectDomain));

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = store.NewEntity();
                        for(const ce of ces)
                            it(
                                ce.Cardinality === 0 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality === 0));
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        store.Assert(x, op1.LocalName, y);
                        for(const ce of ces)
                            it(
                                ce.Cardinality <= 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality <= 1));
                    });

                describe(
                    'Given (op1)OP = {(x, y), (x, z)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        const z = 3;
                        store.Assert(x, op1.LocalName, y);
                        store.Assert(x, op1.LocalName, z);
                        for(const ce of ces)
                            it(
                                ce.Cardinality <= 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality <= 2));
                    });
            });
    });
    
describe(
    'ObjectMinCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms ObjectProperty(op1) and NamedIndividual(i):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i = new NamedIndividual(o1, 'i');
                const op1 = new ObjectProperty(o1, 'op1');
                const ce = new ObjectMinCardinality(op1, 1, new ObjectOneOf([i]));
                const store: IEavStore = new EavStore();
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const iInterpretation = interpreter.InterpretIndividual(i);

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
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        store.Assert(x, op1.LocalName, y);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, iInterpretation);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I), (x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        store.Assert(x, op1.LocalName, iInterpretation);
                        store.Assert(x, op1.LocalName, y              );
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });
