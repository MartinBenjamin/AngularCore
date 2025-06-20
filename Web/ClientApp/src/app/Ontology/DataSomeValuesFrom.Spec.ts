import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { Rule } from '../EavStore/Datalog';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { ClassExpressionObservableInterpreter } from './ClassExpressionObservableInterpreter';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataOneOf } from './DataOneOf';
import { DataSomeValuesFrom } from './DataSomeValuesFrom';
import { IClassExpression } from './IClassExpression';
import { Ontology } from "./Ontology";
import { OntologyWriter } from './OntologyWriter';
import { DataProperty } from './Property';

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
                function Test(
                    store           : IEavStore,
                    ceInterpretation: (ce: IClassExpression) => ReadonlySet<any>,
                    iInterpretation : (i: any) => any
                    )
                {
                    describe(
                        'Given (dp1)DP = {}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            it(
                                `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(ceInterpretation(ce).has(x)).toBe(false));
                        });

                    describe(
                        'Given (dp1)DP = {(x, 1)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 1);
                            it(
                                `x ∈ (${classExpressionWriter.Write(ce)})C`,
                                () => expect(ceInterpretation(ce).has(x)).toBe(true));
                        });

                    describe(
                        'Given (dp1)DP = {(x, 2)}:',
                        () =>
                        {
                            const x = store.NewEntity();
                            store.Assert(x, dp1.LocalName, 2);
                            it(
                                `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(ceInterpretation(ce).has(x)).toBe(false));
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
                                () => expect(ceInterpretation(ce).has(x)).toBe(true));
                        });
                }
                {
                    const interpreter = new ClassExpressionSignalInterpreter(
                        o1,
                        store);

                    function ceInterpretation(
                        ce: IClassExpression
                        ): ReadonlySet<any>
                    {
                        let signal: Signal;
                        try
                        {
                            signal = interpreter.ClassExpression(ce);
                            return store.SignalScheduler.Sample(signal);
                        }
                        finally
                        {
                            store.SignalScheduler.RemoveSignal(signal);
                        }
                    }

                    Test(
                        store,
                        ceInterpretation,
                        null);
                }
                {
                    const interpreter = new ClassExpressionObservableInterpreter(
                        o1,
                        store);

                    function ceInterpretation(
                        ce: IClassExpression
                        ): ReadonlySet<any>
                    {
                        let subscription: Subscription;
                        try
                        {
                            let elements: Set<any> = null;
                            subscription = interpreter.ClassExpression(ce).subscribe(m => elements = m);
                            return elements;
                        }
                        finally
                        {
                            subscription.unsubscribe();
                        }
                    }

                    Test(
                        store,
                        ceInterpretation,
                        null);
                }
                {
                    const rules: Rule[] = [];
                    const interpreter = new AxiomInterpreter(
                        o1,
                        store,
                        rules);
                    for(const axiom of o1.Axioms)
                        axiom.Accept(interpreter);

                    function ceInterpretation(
                        ce: IClassExpression
                        ): ReadonlySet<any>
                    {
                        return new Set(store.Query(['?x'], [[ce.Select(interpreter.ClassExpressionInterpreter), '?x']], ...rules).flat());
                    }

                    Test(
                        store,
                        ceInterpretation,
                        null);
                }
            });
    });
