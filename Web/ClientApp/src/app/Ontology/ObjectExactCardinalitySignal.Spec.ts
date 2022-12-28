import { } from 'jasmine';
import { Signal } from '../Signal';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { EavStore } from './EavStore';
import { FunctionalObjectProperty } from './FunctionalObjectProperty';
import { IClassExpression } from './IClassExpression';
import { IEavStore } from './IEavStore';
import { NamedIndividual } from './NamedIndividual';
import { ObjectExactCardinality } from './ObjectExactCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectExactCardinality( n OPE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ces = [0, 1, 2].map(cardinality => new ObjectExactCardinality(op1, cardinality));
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
                                ce.Cardinality === 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality === 1));
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
                                ce.Cardinality === 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality === 2));
                    });
            });

        describe(
            'Given an Ontology o1 with axioms ObjectProperty(op1) and FunctionalObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                new FunctionalObjectProperty(o1, op1);
                const ce = new ObjectExactCardinality(op1, 1);
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

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        store.Assert(x, op1.LocalName, y);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, y), (x, z)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        const z = 3;
                        store.Assert(x, op1.LocalName, y);
                        store.Assert(x, op1.LocalName, z);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });

describe(
    'ObjectExactCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms ObjectProperty(op1) and NamedIndividual(i):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const i = new NamedIndividual(o1, 'i');
                const ce = new ObjectExactCardinality(op1, 0, new ObjectOneOf([i]));
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
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, iInterpretation);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });
            });

        describe(
            'Given an Ontology o1 with axioms ObjectProperty(op1), NamedIndividual(i1) and NamedIndividual(i2):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                const op1 = new ObjectProperty(o1, 'op1');
                const ce = new ObjectExactCardinality(op1, 1, new ObjectOneOf([i1, i2]));
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
                    'Given (op1)OP = {(x, (i1)I)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I), (x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        store.Assert(x, op1.LocalName, i1Interpretation);
                        store.Assert(x, op1.LocalName, y               );
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, (i2)I)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i2Interpretation);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, (i2)I), (x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        const y = 2;
                        store.Assert(x, op1.LocalName, i2Interpretation);
                        store.Assert(x, op1.LocalName, y               );
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I), (x, (i2)I)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation);
                        store.Assert(x, op1.LocalName, i2Interpretation);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });
            });
    });
