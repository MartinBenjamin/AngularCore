import { } from 'jasmine';
import { ArraySet } from '../Collections/ArraySet';
import { Rule } from "../EavStore/Datalog";
import { DatalogSignalInterpreter } from '../EavStore/DatalogSignalInterpreter';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IDatalogInterpreter } from '../EavStore/IDatalogInterpreter';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { ClassAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { Class } from './Class';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { WrapperType } from './Wrapped';

describe(
    'Declare( Class( C ) )',
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
                store.Assert(
                    iInterpretation,
                    'rdf:type',
                    c.Iri);
                for(var axiom of o.Axioms)
                    axiom.Accept(interpreter);

                const datalogInterpreter: IDatalogInterpreter<WrapperType.Signal> = new DatalogSignalInterpreter(
                    store,
                    tupleCompare);

                const x = store.Signal(['?x'], [['o.c', '?x']], ...rules);
                //const x = store.Signal(['?x'], [['o.c', '?x']], [['o.c', '?x'], [['?x', 'rdf:type', 'o.c']]]);
                //const signals = datalogInterpreter.Rules(rules);
                //const signal = signals.get(c.Iri);
                const value = new ArraySet([...store.SignalScheduler.Sample(x)]);

                it(
                    `(i)I ∈ (${classExpressionWriter.Write(c)})C`,
                    () => expect(value.has([iInterpretation])).toBe(true));
            });
    });
