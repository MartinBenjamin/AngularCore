import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from '../EavStore/Datalog';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { DataPropertyAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { Class } from './Class';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataHasValue } from './DataHasValue';
import { EquivalentClasses } from './EquivalentClasses';
import { NamedIndividual } from './NamedIndividual';
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
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        const c1 = new Class(o1, 'c1');
        const ce = new DataHasValue(dp1, 1);
        new EquivalentClasses(o1, [c1, ce]);
        new DataPropertyAssertion(o1, dp1, i1, 1);

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
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                const i2Interpretation = interpreter.InterpretIndividual(i2);
                for(const axiom of o1.Axioms)
                    axiom.Accept(interpreter);

                //console.log(JSON.stringify(rules));

                const c1Signal = store.Signal(['?x'], [[c1.Iri, '?x']], ...rules);
                const c1Interpretation = new SortedSet(tupleCompare, store.SignalScheduler.Sample(c1Signal));
                store.SignalScheduler.RemoveSignal(c1Signal);

                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(ce)})C`,
                    () => expect(c1Interpretation.has([i1Interpretation])).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce)})C)`,
                    () => expect(c1Interpretation.has([i2Interpretation])).toBe(false));
            });
    });
