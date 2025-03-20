import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from "../EavStore/Datalog";
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { Class } from './Class';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { EquivalentClasses } from './EquivalentClasses';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';

describe(
    'EquivalentClasses( CE1 ... CEn ) ((CEj)C = (CEk)C for each 1 ≤ j ≤ n and each 1 ≤ k ≤ n)',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1: IOntology = new Ontology('o1');
        const c1 = new Class(o1, 'c1');
        const c2 = new Class(o1, 'c2');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        new ClassAssertion(o1, c1, i1);
        new ClassAssertion(o1, c2, i2);
        new EquivalentClasses(o1, [c1, c2]);

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

                const c1Interpretation = new SortedSet(tupleCompare, store.Query(['?x'], [[c1.Iri, '?x']], ...rules));
                const c2Interpretation = new SortedSet(tupleCompare, store.Query(['?x'], [[c2.Iri, '?x']], ...rules));
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c1)})C`,
                    () => expect(c1Interpretation.has([i1Interpretation])).toBe(true));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(c1)})C`,
                    () => expect(c1Interpretation.has([i2Interpretation])).toBe(true));
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(c2)})C`,
                    () => expect(c2Interpretation.has([i1Interpretation])).toBe(true));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(c2)})C`,
                    () => expect(c2Interpretation.has([i2Interpretation])).toBe(true));
            });
    });
