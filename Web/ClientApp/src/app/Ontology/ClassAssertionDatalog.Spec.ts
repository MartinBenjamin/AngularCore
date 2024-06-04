import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { DatalogSignalInterpreter } from '../EavStore/DatalogSignalInterpreter1';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IDatalogInterpreter } from '../EavStore/IDatalogInterpreter';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { Class } from './Class';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { WrapperType } from './Wrapped';

describe(
    'ClassAssertion( CE a ) ((a)I ∈ (CE)C)',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms Class(c1), NamedIndividual(i1) and ClassAssertion(c1, i1):',
            () =>
            {
                const o1: IOntology = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const i1 = new NamedIndividual(o1, 'i1');
                new ClassAssertion(o1, c1, i1);
                const store: IEavStore = new EavStore();
                const rules: Rule[] = [];
                const interpreter = new AxiomInterpreter(
                    o1,
                    store,
                    rules);
                const i1Interpretation = interpreter.InterpretIndividual(i1);
                for(const axiom of o1.Axioms)
                    axiom.Accept(interpreter);

                console.log(JSON.stringify(rules));
                const datalogInterpreter: IDatalogInterpreter<WrapperType.Signal> = new DatalogSignalInterpreter(
                    store,
                    tupleCompare);

                {
                    const signal = store.Signal(['?x'], [[c1.Iri, '?x']], ...rules);
                    const value = new SortedSet(tupleCompare, store.SignalScheduler.Sample(signal));
                    store.SignalScheduler.RemoveSignal(signal);
                    it(
                        `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                        () => expect(value.has([i1Interpretation])).toBe(true));
                }
                {
                    const signals = datalogInterpreter.Rules(rules);
                    const signal = signals.get(c1.Iri);
                    const value = new SortedSet(tupleCompare, store.SignalScheduler.Sample(signal));
                    store.SignalScheduler.RemoveSignal(signal);
                    it(
                        `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                        () => expect(value.has([c1.Iri, i1Interpretation])).toBe(true));
                }
            });
    });
