import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataOneOf } from './DataOneOf';
import { DataSomeValuesFrom } from './DataSomeValuesFrom';
import { IClassExpression } from './IClassExpression';
import { EavStore, IEavStore, ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'DataSomeValuesFrom( DPE1 ... DPEn DR ) ({ x | ∃ y1, ... , yn : ( x , yk ) ∈ (DPEk)DP for each 1 ≤ k ≤ n and ( y1 , ... , yn ) ∈ (DR)DT })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                const ce = new DataSomeValuesFrom(dp1, new DataOneOf([1]));
                const store: IEavStore = new EavStore();
                const generator = new ObservableGenerator(
                    o1,
                    store);

                function elements(
                    ce: IClassExpression
                    ): Set<any>
                {
                    let subscription: Subscription;
                    try
                    {
                        let elements: Set<any> = null;
                        subscription = generator.ClassExpression(ce).subscribe(m => elements = m);
                        return elements;
                    }
                    finally
                    {
                        subscription.unsubscribe();
                    }
                }

                describe(
                    'Given (dp1)DP = {}:',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
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
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });
