import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from '../EavStore/Datalog';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Tuple } from '../EavStore/Tuple';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataMaxCardinality } from './DataMaxCardinality';
import { DataOneOf } from './DataOneOf';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { DataProperty } from './Property';

describe(
    'DataMaxCardinality( n DPE ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP } ≤ n })',
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

                const ces = [0, 1, 2].map(cardinality => new DataMaxCardinality(dp1, cardinality));
                const cePredicateSymbols = new Map(ces.map(ce => [ce, ce.Select(interpreter.ClassExpressionInterpreter)]));
                //console.log(JSON.stringify(rules));

                function Query(
                    cePredicateSymbol: string
                    ): Set<Tuple>
                {
                    return new SortedSet(tupleCompare, store.Query(['?x'], [[cePredicateSymbol, '?x']], ...rules));
                }

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = store.NewEntity();
                        for(const ce of ces)
                            it(
                                ce.Cardinality >= 0 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(Query(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality >= 0));
                    });

                describe(
                    'Given (dp1)DP = {(x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 2);
                        for(const ce of ces)
                            it(
                                ce.Cardinality >= 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(Query(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality >= 1));
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
                                ce.Cardinality >= 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(Query(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality >= 2));
                    });
            });
    });

describe(
    'DataMaxCardinality( n DPE DR ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP and y ∈ (DR)DT } ≤ n })',
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

                const ce = new DataMaxCardinality(dp1, 1, new DataOneOf([1, 2]));
                const cePredicateSymbol = ce.Select(interpreter.ClassExpressionInterpreter);
                //console.log(JSON.stringify(rules));

                function Query(
                    cePredicateSymbol: string
                    ): Set<Tuple>
                {
                    return new SortedSet(tupleCompare, store.Query(['?x'], [[cePredicateSymbol, '?x']], ...rules));
                }

                describe(
                    'Given (dp1)DP = {(x, 3)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 3);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 3)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        store.Assert(x, dp1.LocalName, 3);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 2);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 2), (x, 3)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 2);
                        store.Assert(x, dp1.LocalName, 3);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        store.Assert(x, dp1.LocalName, 2);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(false));
                    });
            });
    });
