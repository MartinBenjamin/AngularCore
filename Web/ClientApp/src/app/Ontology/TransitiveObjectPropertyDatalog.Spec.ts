import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ObjectPropertyAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { ObjectProperty } from './Property';
import { PropertyExpressionWriter } from './PropertyExpressionWriter';
import { TransitiveObjectProperty } from './TransitiveObjectProperty';

describe(
    'TransitiveObjectProperty( OPE ) (∀ x , y , z : ( x , y ) ∈ (OPE)OP and ( y , z ) ∈ (OPE)OP imply ( x , z ) ∈ (OPE)OP)',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const propertyExpressionWriter = new PropertyExpressionWriter();
        const o1: IOntology = new Ontology('o1');
        const op1 = new ObjectProperty(o1, 'op1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        const i3 = new NamedIndividual(o1, 'i3');
        new TransitiveObjectProperty(o1, op1);
        new ObjectPropertyAssertion(o1, op1, i1, i2);
        new ObjectPropertyAssertion(o1, op1, i2, i3);

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
                const i3Interpretation = interpreter.InterpretIndividual(i3);
                for(const axiom of o1.Axioms)
                    axiom.Accept(interpreter);

                //console.log(JSON.stringify(rules));

                const op1Interpretation = new SortedSet(tupleCompare, store.Query(['?x', '?y'], [[op1.Iri, '?x', '?y']], ...rules));
                it(
                    `( (i1)I , (i2)I ) ∈ (${op1.Select(propertyExpressionWriter)})OP`,
                    () => expect(op1Interpretation.has([i1Interpretation, i2Interpretation])).toBe(true));
                it(
                    `( (i2)I , (i3)I ) ∈ (${op1.Select(propertyExpressionWriter)})OP`,
                    () => expect(op1Interpretation.has([i2Interpretation, i3Interpretation])).toBe(true));
                it(
                    `( (i1)I , (i3)I ) ∈ (${op1.Select(propertyExpressionWriter)})OP`,
                    () => expect(op1Interpretation.has([i1Interpretation, i3Interpretation])).toBe(true));
            });
    });
