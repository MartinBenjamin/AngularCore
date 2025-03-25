import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from '../EavStore/Datalog';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Tuple } from '../EavStore/Tuple';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { NamedIndividual } from './NamedIndividual';
import { ObjectAllValuesFrom } from './ObjectAllValuesFrom';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { ObjectProperty } from './Property';

describe(
    'ObjectAllValuesFrom( OPE CE ) ({ x | ∀ y : ( x, y ) ∈ (OPE)OP implies y ∈ (CE)C })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const op1 = new ObjectProperty(o1, 'op1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        const i3 = new NamedIndividual(o1, 'i3');

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

                const ce = new ObjectAllValuesFrom(op1, new ObjectOneOf([i1, i2]));
                const cePredicateSymbol = ce.Select(interpreter.ClassExpressionInterpreter);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);
                const i3Interpretation = interpreter.InterpretIndividual(i3);
                //console.log(JSON.stringify(rules));

                function Query(
                    cePredicateSymbol: string
                    ): Set<Tuple>
                {
                    return new SortedSet(tupleCompare, store.Query(['?x'], [[cePredicateSymbol, '?x']], ...rules));
                }

                describe(
                    'Given (op1)OP = {}',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i1)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i2)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i2Interpretation);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
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
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
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
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(false));
                    });
            });
    });
