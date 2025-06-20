import { } from 'jasmine';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataOneOf } from './DataOneOf';
import { DataSomeValuesFrom } from './DataSomeValuesFrom';
import { IClassExpression } from './IClassExpression';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { DataProperty } from './Property';
import { Test } from './Test';

describe(
    'DataSomeValuesFrom( DPE1 ... DPEn DR ) ({ x | ∃ y1, ... , yn : ( x , yk ) ∈ (DPEk)DP for each 1 ≤ k ≤ n and ( y1 , ... , yn ) ∈ (DR)DT })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const dp1 = new DataProperty(o1, 'dp1');
        const ce = new DataSomeValuesFrom(dp1, new DataOneOf([1]));
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
                        iInterpretation : (i: any) => any
                        ): void =>
                    {
                        describe(
                            'Given (dp1)DP = {}:',
                            () => {
                                const x = store.NewEntity();
                                it(
                                    `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(false));
                            });

                        describe(
                            'Given (dp1)DP = {(x, 1)}:',
                            () => {
                                const x = store.NewEntity();
                                store.Assert(x, dp1.LocalName, 1);
                                it(
                                    `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(true));
                            });

                        describe(
                            'Given (dp1)DP = {(x, 2)}:',
                            () => {
                                const x = store.NewEntity();
                                store.Assert(x, dp1.LocalName, 2);
                                it(
                                    `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(false));
                            });

                        describe(
                            'Given (dp1)DP = {(x, 1), (x, 2)}:',
                            () => {
                                const x = store.NewEntity();
                                store.Assert(x, dp1.LocalName, 1);
                                store.Assert(x, dp1.LocalName, 2);
                                it(
                                    `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                    () => expect(ceInterpretation(ce).has(x)).toBe(true));
                            });
                    });
            });
    });
