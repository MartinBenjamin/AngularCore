import { } from 'jasmine';
import { Signal } from '../Signal';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataExactCardinality } from './DataExactCardinality';
import { DataOneOf } from './DataOneOf';
import { FunctionalDataProperty } from './FunctionalDataProperty';
import { IClassExpression } from './IClassExpression';
import { EavStore, IEavStore } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataExactCardinality( n DPE ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                const ces = [0, 1, 2].map(cardinality => new DataExactCardinality(dp1, cardinality));
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
                    'Given (dp1)DP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        for(const ce of ces)
                            it(
                                ce.Cardinality === 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality === 1));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        store.Assert(x, dp1.LocalName, 2);
                        for(const ce of ces)
                            it(
                                ce.Cardinality === 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality === 2));
                    });
            });

        describe(
            'Given an Ontology o1 with axioms DataProperty(dp1) and FunctionalDataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                new FunctionalDataProperty(o1, dp1);
                const ce = new DataExactCardinality(dp1, 1);
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
                        signal = interpreter.ClassExpression(ce);
                        store.SignalScheduler.AddSignal(
                            m => elements = m,
                            [signal]);
                        return elements;
                    }
                    finally
                    {
                        store.SignalScheduler.RemoveSignal(signal);
                    }
                }

                describe(
                    'Given (dp1)DP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        store.Assert(x, dp1.LocalName, 2);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });

describe(
    'DataExactCardinality( n DPE DR ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP and y ∈ (DR)DT } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
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
                        signal = interpreter.ClassExpression(ce);
                        store.SignalScheduler.AddSignal(
                            m => elements = m,
                            [signal]);
                        return elements;
                    }
                    finally
                    {
                        store.SignalScheduler.RemoveSignal(signal);
                    }
                }

                {
                    const ce = new DataExactCardinality(dp1, 0, new DataOneOf([1]));
                    describe(
                        'Given (dp1)DP = {(x, 2)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 2);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(elements(ce).has(x)).toBe(true));
                        });

                    describe(
                        'Given (dp1)DP = {(x, 1)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 1);
                            it(
                                `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(false));
                        });
                }

                {
                    const ce = new DataExactCardinality(dp1, 1, new DataOneOf([1, 2]));
                    describe(
                        'Given (dp1)OP = {(x, 0)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 3);
                            it(
                                `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(false));
                        });

                    describe(
                        'Given (dp1)OP = {(x, 1)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 1);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(elements(ce).has(x)).toBe(true));
                        });

                    describe(
                        'Given (dp1)OP = {(x, 0), (x, 1)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 0);
                            store.Assert(x, dp1.LocalName, 1);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(elements(ce).has(x)).toBe(true));
                        });

                    describe(
                        'Given (dp1)OP = {(x, 2)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 2);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(elements(ce).has(x)).toBe(true));
                        });

                    describe(
                        'Given (dp1)OP = {(x, 0), (x, 2)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 0);
                            store.Assert(x, dp1.LocalName, 2);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(elements(ce).has(x)).toBe(true));
                        });

                    describe(
                        'Given (dp1)OP = {(x, 1), (x, 2)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 1);
                            store.Assert(x, dp1.LocalName, 2);
                            it(
                                `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(false));
                        });
                }
            });
    });
