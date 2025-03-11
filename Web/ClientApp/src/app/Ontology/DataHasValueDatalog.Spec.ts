import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from '../EavStore/Datalog';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Tuple } from '../EavStore/Tuple';
import { Signal } from '../Signal/Signal';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataHasValue } from './DataHasValue';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { DataProperty } from './Property';

describe(
    'DataHasValue( DPE lt ) ({ x | ( x , (lt)LT ) ∈ (DPE)DP })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const dp1 = new DataProperty(o1, 'dp1');

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

                const ce = new DataHasValue(dp1, 1);
                const cePredicateSymbol = ce.Select(interpreter.ClassExpressionInterpreter);
                //console.log(JSON.stringify(rules));

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

                describe(
                    'Given (dp1)DP = {}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(sample(cePredicateSymbol).has([x])).toBe(false));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(sample(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 2);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(sample(cePredicateSymbol).has([x])).toBe(false));
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
                            () => expect(sample(cePredicateSymbol).has([x])).toBe(true));
                    });
            });
    });
