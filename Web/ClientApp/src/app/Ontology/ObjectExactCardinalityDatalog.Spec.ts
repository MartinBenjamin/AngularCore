import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from '../EavStore/Datalog';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Tuple } from '../EavStore/Tuple';
import { Signal } from '../Signal/Signal';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectExactCardinality } from './ObjectExactCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { ObjectProperty } from './Property';

describe(
    'ObjectExactCardinality( n OPE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } = n })',
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

                const ces = [0, 1, 2].map(cardinality => new ObjectExactCardinality(op1, cardinality));
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
                                ce.Cardinality === 0 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(Query(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality === 0));
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
                                () => expect(Query(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality === 1));
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
                                () => expect(Query(cePredicateSymbols.get(ce)).has([x])).toBe(ce.Cardinality === 2));
                    });
            });
    });

describe(
    'ObjectExactCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } = n })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        {
            const o1 = new Ontology('o1');
            const op1 = new ObjectProperty(o1, 'op1');
            const i = new NamedIndividual(o1, 'i');

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

                    const ce = new ObjectExactCardinality(op1, 0, new ObjectOneOf([i]));
                    const cePredicateSymbol = ce.Select(interpreter.ClassExpressionInterpreter);
                    const iInterpretation = interpreter.InterpretIndividual(i);

                    function Query(
                        cePredicateSymbol: string
                        ): Set<Tuple>
                    {
                        return new SortedSet(tupleCompare, store.Query(['?x'], [[cePredicateSymbol, '?x']], ...rules));
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
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                        });

                    describe(
                        'Given (op1)OP = {(x, (i)I)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, op1.LocalName, iInterpretation);
                            it(
                                `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(false));
                        });
                });
        }

        {
            const o1 = new Ontology('o1');
            const i1 = new NamedIndividual(o1, 'i1');
            const i2 = new NamedIndividual(o1, 'i2');
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

                    const ce = new ObjectExactCardinality(op1, 1, new ObjectOneOf([i1, i2]));
                    const cePredicateSymbol = ce.Select(interpreter.ClassExpressionInterpreter);
                    const i1Interpretation = interpreter.InterpretIndividual(i1);
                    const i2Interpretation = interpreter.InterpretIndividual(i2);

                    function Query(
                        cePredicateSymbol: string
                        ): Set<Tuple>
                    {
                        return new SortedSet(tupleCompare, store.Query(['?x'], [[cePredicateSymbol, '?x']], ...rules));
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
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(false));
                        });

                    describe(
                        'Given (op1)OP = {(x, (i1)I)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, op1.LocalName, i1Interpretation);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
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
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                        });

                    describe(
                        'Given (op1)OP = {(x, (i2)I)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, op1.LocalName, i2Interpretation);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
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
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
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
                                () => expect(Query(cePredicateSymbol).has([x])).toBe(false));
                        });
                });
        }
    });
