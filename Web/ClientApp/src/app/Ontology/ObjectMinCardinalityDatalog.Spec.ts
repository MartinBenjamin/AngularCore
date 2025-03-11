import { } from 'jasmine';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import {ObjectProperty} from './Property';
import {Rule} from '../EavStore/Datalog';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { SortedSet } from '../Collections/SortedSet';
import { Tuple } from '../EavStore/Tuple';

describe(
    'ObjectMinCardinality(n OPE) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } ≥ n })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const op1 = new ObjectProperty(o1, 'op1');

        describe(
            `Given ${ontologyWriter(o1)}:`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const rules: Rule[] = [];
                const interpreter = new AxiomInterpreter(
                    o1,
                    store,
                    rules);
                for(const axiom of o1.Axioms)
                    axiom.Accept(interpreter);

                const ces = [0, 1, 2].map(cardinality => new ObjectMinCardinality(op1, cardinality));
                const cePredicateSymbols = new Map(ces.map(ce => [ce, ce.Select(interpreter.ClassExpressionInterpreter)]));
                console.log(JSON.stringify(rules));

                function sample(
                    cePredicateSymbol: string
                    ): Set<Tuple>
                {
                    let signal: Signal;

                    try
                    {
                        signal = store.Signal(['?x'], [[cePredicateSymbol, '?x']], ...rules);
                        return new SortedSet(tupleCompare, store.SignalScheduler.Sample(signal));
                    }
                    finally
                    {
                        store.SignalScheduler.RemoveSignal(signal);
                    }
                }

                //it(
                //    `(${classExpressionWriter.Write(ces[0])})C = ΔI`,
                //    () => expect(interpreter.ClassExpression(ces[0])).toBe(interpreter.ObjectDomain));

                //describe(
                //    'Given x ∈ ΔI:',
                //    () =>
                //    {
                //        const x = store.NewEntity();
                //        for(const ce of ces)
                //            it(
                //                ce.Cardinality === 0 ?
                //                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                //                () => expect(sample(cePredicateSymbols.get(ce)).has(x)).toBe(ce.Cardinality === 0));
                //    });

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
                                () => expect(sample(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality <= 1));
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
                                () => expect(sample(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality <= 2));
                    });
            });
    });
    
describe(
    'ObjectMinCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } ≥ n })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const i = new NamedIndividual(o1, 'i');
        const op1 = new ObjectProperty(o1, 'op1');

        describe(
            `Given ${ontologyWriter(o1)}:`,
            () =>
            {
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
