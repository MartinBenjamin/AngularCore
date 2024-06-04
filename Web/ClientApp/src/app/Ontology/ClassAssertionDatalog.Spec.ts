import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { DatalogSignalInterpreter } from '../EavStore/DatalogSignalInterpreter';
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
            'Given an Ontology o with axioms Class(c), NamedIndividual(i) and ClassAssertion(c, i):',
            () =>
            {
                const o: IOntology = new Ontology('o');
                const c = new Class(o, 'c');
                const i = new NamedIndividual(o, 'i');
                new ClassAssertion(o, c, i);
                const store: IEavStore = new EavStore();
                const rules: Rule[] = [];
                const interpreter = new AxiomInterpreter(
                    o,
                    store,
                    rules);
                const iInterpretation = interpreter.InterpretIndividual(i);
                for(const axiom of o.Axioms)
                    axiom.Accept(interpreter);

                const datalogInterpreter: IDatalogInterpreter<WrapperType.Signal> = new DatalogSignalInterpreter(
                    store,
                    tupleCompare);

                const signal = store.Signal(['?x'], [['o.c', '?x']], ...rules);
                const value = new SortedSet(tupleCompare, store.SignalScheduler.Sample(signal));

                it(
                    `(i)I ∈ (${classExpressionWriter.Write(c)})C`,
                    () => expect(value.has([iInterpretation])).toBe(true));

                const signals = datalogInterpreter.Rules(rules);
                const signal1 = signals.get(c.Iri);

                const value1 = new SortedSet(tupleCompare, store.SignalScheduler.Sample(signal1));

                it(
                    `(i)I ∈ (${classExpressionWriter.Write(c)})C`,
                    () => expect(value1.has(['o.c', iInterpretation])).toBe(true));
            });
    });
