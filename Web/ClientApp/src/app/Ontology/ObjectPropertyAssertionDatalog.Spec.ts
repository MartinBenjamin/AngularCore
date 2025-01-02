import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ObjectPropertyAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { AxiomWriter } from './AxiomWriter';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectPropertyAssertion( OPE a1 a2 ) (( (a1)I , (a2)I ) ∈ (OPE)OP)',
    () =>
    {
        const axiomWriter = new AxiomWriter();
        const propertyExpressionWriter = axiomWriter.PropertyExpressionWriter;
        const o1: IOntology = new Ontology('o1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        const op1 = new ObjectProperty(o1, 'op1');
        new ObjectPropertyAssertion(o1, op1, i1, i2);

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
                    const op1Signal = store.Signal(['?x', '?y'], [[op1.Iri, '?x', '?y']], ...rules);
                    const op1Interpretation = new SortedSet(tupleCompare, store.SignalScheduler.Sample(op1Signal));
                    store.SignalScheduler.RemoveSignal(op1Signal);
                    it(
                        `( (i1)I , (i2)I ) ∈ (${op1.Select(propertyExpressionWriter)})OP`,
                        () => expect(op1Interpretation.has([i1Interpretation, i2Interpretation])).toBe(true));
                    it(
                        `¬(( (i2)I , (i1)I ) ∈ (${op1.Select(propertyExpressionWriter)})OP)`,
                        () => expect(op1Interpretation.has([i2Interpretation, i1Interpretation])).toBe(false));
                }
            });
    });
