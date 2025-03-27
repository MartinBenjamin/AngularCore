import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { DataPropertyAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { DataProperty } from './Property';
import { PropertyExpressionWriter } from './PropertyExpressionWriter';

describe(
    'DataPropertyAssertion( DPE a lt ) (( (a)I , (lt)LT ) ∈ (DPE)DP)',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const propertyExpressionWriter = new PropertyExpressionWriter();
        const o1: IOntology = new Ontology('o1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        const dp1 = new DataProperty(o1, 'dp1');
        new DataPropertyAssertion(o1, dp1, i1, 1);
        new DataPropertyAssertion(o1, dp1, i2, 2);

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
                const i1Interpretation = interpreter.Individual(i1);
                const i2Interpretation = interpreter.Individual(i2);
                for(const axiom of o1.Axioms)
                    axiom.Accept(interpreter);

                //console.log(JSON.stringify(rules));

                const dp1Interpretation = new SortedSet(tupleCompare, store.Query(['?x', '?y'], [[dp1.Iri, '?x', '?y']], ...rules));
                it(
                    `( (i1)I , (1)LT ) ∈ (${dp1.Select(propertyExpressionWriter)})DP`,
                    () => expect(dp1Interpretation.has([i1Interpretation, 1])).toBe(true));
                it(
                    `¬(( (i1)I , (2)LT ) ∈ (${dp1.Select(propertyExpressionWriter)})DP)`,
                    () => expect(dp1Interpretation.has([i1Interpretation, 2])).toBe(false));
                it(
                    `¬(( (i2)I , (1)LT ) ∈ (${dp1.Select(propertyExpressionWriter)})DP)`,
                    () => expect(dp1Interpretation.has([i2Interpretation, 1])).toBe(false));
                it(
                    `( (i2)I , (2)LT ) ∈ (${dp1.Select(propertyExpressionWriter)})DP`,
                    () => expect(dp1Interpretation.has([i2Interpretation, 2])).toBe(true));
            });
    });
