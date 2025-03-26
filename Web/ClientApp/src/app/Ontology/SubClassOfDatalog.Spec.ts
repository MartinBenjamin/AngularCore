import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { Class } from './Class';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { SubClassOf } from './SubClassOf';

describe(
    'SubClassOf( CE1 CE2 ) ((CE1)C ⊆ (CE2)C)',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const c1 = new Class(o1, 'c1');
        const c2 = new Class(o1, 'c2');
        const i1 = new NamedIndividual(o1, 'i1');
        new ClassAssertion(o1, c1, i1);
        new SubClassOf(o1, c1, c2);

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
                for(const axiom of o1.Axioms)
                    axiom.Accept(interpreter);

                //console.log(JSON.stringify(rules));

                const c2Signal = store.Signal(['?x'], [[c2.Iri, '?x']], ...rules);
                const c2Interpretation = new SortedSet(tupleCompare, store.SignalScheduler.Sample(c2Signal));
                store.SignalScheduler.RemoveSignal(c2Signal);
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c2)})C`,
                    () => expect(c2Interpretation.has([i1Interpretation])).toBe(true));
            });;
    });
