import { } from 'jasmine';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataAllValuesFrom } from './DataAllValuesFrom';
import { DataOneOf } from './DataOneOf';
import { IClassExpression } from './IClassExpression';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { DataProperty } from './Property';

describe(
    'DataAllValuesFrom( DPE1 ... DPEn DR ) ({ x | ∀ y1, ... , yn : ( x , yk ) ∈ (DPEk)DP for each 1 ≤ k ≤ n imply ( y1 , ... , yn ) ∈ (DR)DT })',
    () =>
    {
        const ontologyWriter = OntologyWriter();
        const classExpressionWriter = new ClassExpressionWriter();
        const o1 = new Ontology('o1');
        const dp1 = new DataProperty(o1, 'dp1');

        describe(
            `Given ${ontologyWriter(o1)}:`,
            () =>
            {
                const ce = new DataAllValuesFrom(dp1, new DataOneOf([1]));
                const store: IEavStore = new EavStore();
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);

                function elements(
                    ce: IClassExpression
                    ): Set<any>
                {
                    let signal: Signal<Set<any>>;
                    let elements: Set<any> = null;
                    try
                    {
                        signal = store.SignalScheduler.AddSignal(
                            m => elements = m,
                            [interpreter.ClassExpression(ce)]);
                        return elements;
                    }
                    finally
                    {
                        store.SignalScheduler.RemoveSignal(signal);
                    }
                }

                describe(
                    'Given (dp1)DP = {}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (dp1)DP = {(x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 2);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, dp1.LocalName, 1);
                        store.Assert(x, dp1.LocalName, 2);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });
            });
    });
