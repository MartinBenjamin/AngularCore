import { } from 'jasmine';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { IIndividual } from './IIndividual';
import { NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { ObjectProperty } from './Property';
import { Test } from './Test';

describe(
    'ObjectSomeValuesFrom( OPE CE ) ({ x | ∃ y : ( x, y ) ∈ (OPE)OP and y ∈ (CE)C })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const op1 = new ObjectProperty(o1, 'op1');
        const i1 = new NamedIndividual(o1, 'i1');
        const i2 = new NamedIndividual(o1, 'i2');
        const i3 = new NamedIndividual(o1, 'i3');
        const ce = new ObjectSomeValuesFrom(op1, new ObjectOneOf([i1, i2]));
        const store: IEavStore = new EavStore();

        describe(
            `Given ${ontologyWriter(o1)}:`,
            () =>
            {
                Test(
                    o1,
                    store,
                    (
                        store           : IEavStore,
                        ceInterpretation: (ce: IClassExpression) => ReadonlySet<any>,
                        iInterpretation : (i: IIndividual) => any
                        ): void =>
                    {
                        describe(
                            'Given (op1)OP = {}',
                            () =>
                            {
                                const x = store.NewEntity();
                                it(
                                    `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(false));
                            });

                        describe(
                            'Given (op1)OP = {(x, i1)}',
                            () =>
                            {
                                const x = store.NewEntity();
                                store.Assert(x, op1.LocalName, iInterpretation(i1));
                                it(
                                    `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(true));
                            });

                        describe(
                            'Given (op1)OP = {(x, i2)}',
                            () =>
                            {
                                const x = store.NewEntity();
                                store.Assert(x, op1.LocalName, iInterpretation(i2));
                                it(
                                    `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(true));
                            });

                        describe(
                            'Given (op1)OP = {(x, i3)}',
                            () =>
                            {
                                const x = store.NewEntity();
                                store.Assert(x, op1.LocalName, iInterpretation(i3));
                                it(
                                    `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(false));
                            });

                        describe(
                            'Given (op1)OP = {(x, i1), (x, i2), (x, i3)}',
                            () =>
                            {
                                const x = store.NewEntity();
                                store.Assert(x, op1.LocalName, iInterpretation(i1));
                                store.Assert(x, op1.LocalName, iInterpretation(i2));
                                store.Assert(x, op1.LocalName, iInterpretation(i3));
                                it(
                                    `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(true));
                            });
            });
        });
    });
