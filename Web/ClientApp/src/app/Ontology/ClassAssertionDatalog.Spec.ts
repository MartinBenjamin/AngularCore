import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { DatalogSignalInterpreter } from '../EavStore/DatalogSignalInterpreter1';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IDatalogInterpreter } from '../EavStore/IDatalogInterpreter';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { AxiomWriter } from './AxiomWriter';
import { Class } from './Class';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { WrapperType } from './Wrapped';

describe(
    'ClassAssertion( CE a ) ((a)I ∈ (CE)C)',
    () =>
    {
        const axiomWriter = new AxiomWriter();
        const classExpressionWriter = axiomWriter.ClassExpressionWriter;
        const o1: IOntology = new Ontology('o1');
        const c1 = new Class(o1, 'c1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        new ClassAssertion(o1, c1, i1);

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
                    const c1Signal = store.Signal(['?x'], [[c1.Iri, '?x']], ...rules);
                    const c1Interpretation = new SortedSet(tupleCompare, store.SignalScheduler.Sample(c1Signal));
                    store.SignalScheduler.RemoveSignal(c1Signal);
                    it(
                        `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                        () => expect(c1Interpretation.has([i1Interpretation])).toBe(true));
                    it(
                        `¬((i2)I ∈ (${classExpressionWriter.Write(c1)})C)`,
                        () => expect(c1Interpretation.has([i2Interpretation])).toBe(false));
                }
                {
                    const datalogInterpreter: IDatalogInterpreter<WrapperType.Signal> = new DatalogSignalInterpreter(
                        store,
                        tupleCompare);
                    const signals = datalogInterpreter.Rules(rules);
                    const c1Signal = signals.get(c1.Iri);
                    const c1Interpretation = new SortedSet(tupleCompare, store.SignalScheduler.Sample(c1Signal));
                    store.SignalScheduler.RemoveSignal(c1Signal);
                    it(
                        `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                        () => expect(c1Interpretation.has([c1.Iri, i1Interpretation])).toBe(true));
                    it(
                        `¬((i2)I ∈ (${classExpressionWriter.Write(c1)})C)`,
                        () => expect(c1Interpretation.has([i2Interpretation])).toBe(false));
                }
            });
    });
