import { } from 'jasmine';
import { SortedSet } from '../Collections/SortedSet';
import { Rule } from '../EavStore/Datalog';
import { EavStore, tupleCompare } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Tuple } from '../EavStore/Tuple';
import { Signal } from '../Signal/Signal';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { NamedIndividual } from './NamedIndividual';
import { ObjectHasValue } from './ObjectHasValue';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { ObjectProperty } from './Property';

describe(
    'ObjectHasValue( OPE a ) ({ x | ( x , (a)I ) ∈ (OPE)OP })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const op1 = new ObjectProperty(o1, 'op1');
        const i1 = new NamedIndividual(o1, 'i1');
        const ce = new ObjectHasValue(op1, i1);

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

                let cePredicateSymbol = ce.Select(interpreter.ClassExpressionInterpreter);
                //console.log(JSON.stringify(rules));

                function Query(
                    cePredicateSymbol: string
                    ): Set<Tuple>
                {
                    return new SortedSet(tupleCompare, store.Query(['?x'], [[cePredicateSymbol, '?x']], ...rules));
                }

                describe(
                    'Given (op1)OP = {}',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(false));
                    });

                describe(
                    'Given (op1)OP = {(x, i1)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(Query(cePredicateSymbol).has([x])).toBe(true));
                    });
            });
    });
