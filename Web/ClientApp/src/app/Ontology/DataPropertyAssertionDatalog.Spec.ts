import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { DataPropertyAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { AxiomWriter } from './AxiomWriter';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataPropertyAssertion( DPE a lt ) (( (a)I , (lt)LT ) ∈ (DPE)DP)',
    () =>
    {
        const axiomWriter = new AxiomWriter();
        const o1: IOntology = new Ontology('o1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        const dp1 = new DataProperty(o1, 'dp1');
        new DataPropertyAssertion(o1, dp1, i1, 1);
        new DataPropertyAssertion(o1, dp1, i2, 2);

        describe(
            `Given an Ontology o1 with axioms ${o1.Axioms.map(axiom => axiom.Select(axiomWriter)).join(', ')}:`,
            () =>
            {
                const store: IEavStore = new EavStore();
                const rules: Rule[] = [];
                const interpreter = new AxiomInterpreter(
                    o1,
                    store,
                    rules);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);
                for(const axiom of o1.Axioms)
                    axiom.Accept(interpreter);

                //console.log(JSON.stringify(rules));

                {
                    const dp1Signal = store.Signal(['?x', '?y'], [[dp1.Iri, '?x', '?y']], ...rules);
                    const dp1Interpretation = new SortedSet(tupleCompare, store.SignalScheduler.Sample(dp1Signal));
                    store.SignalScheduler.RemoveSignal(dp1Signal);
                    it(
                        `( (i1)I , (1)LT ) ∈ (dp1)DP`,
                        () => expect(dp1Interpretation.has([i1Interpretation, 1])).toBe(true));
                    it(
                        `¬(( (i1)I , (2)LT ) ∈ (dp1)DP)`,
                        () => expect(dp1Interpretation.has([i1Interpretation, 2])).toBe(false));
                    it(
                        `¬(( (i2)I , (1)LT ) ∈ (dp1)DP)`,
                        () => expect(dp1Interpretation.has([i2Interpretation, 1])).toBe(false));
                    it(
                        `( (i2)I , (2)LT ) ∈ (dp1)DP`,
                        () => expect(dp1Interpretation.has([i2Interpretation, 2])).toBe(true));
                }
            });
    });
