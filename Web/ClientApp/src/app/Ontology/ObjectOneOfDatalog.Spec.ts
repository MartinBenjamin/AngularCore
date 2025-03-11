import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from '../EavStore/Datalog';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Tuple } from '../EavStore/Tuple';
import { Signal } from '../Signal/Signal';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';

describe(
    'ObjectOneOf( a1 ... an ) ({ (a1)I , ... , (an)I })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');

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
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);

                const ce1 = new ObjectOneOf([i1]);
                const ce2 = new ObjectOneOf([i2]);
                const ce1PredicateSymbol = ce1.Select(interpreter.ClassExpressionInterpreter);
                const ce2PredicateSymbol = ce2.Select(interpreter.ClassExpressionInterpreter);
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

                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(ce1)})C`,
                    () => expect(sample(ce1PredicateSymbol).has([i1Interpretation])).toBe(true));
                it(
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce2)})C)`,
                    () => expect(sample(ce2PredicateSymbol).has([i1Interpretation])).toBe(false));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce1)})C)`,
                    () => expect(sample(ce1PredicateSymbol).has([i2Interpretation])).toBe(false));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce2)})C`,
                    () => expect(sample(ce2PredicateSymbol).has([i2Interpretation])).toBe(true));
            });
    });
