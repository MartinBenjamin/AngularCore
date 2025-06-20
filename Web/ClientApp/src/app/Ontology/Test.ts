import { Subscription } from "../../../node_modules/rxjs/index";
import { Rule } from "../EavStore/Datalog";
import { IEavStore } from "../EavStore/IEavStore";
import { Signal } from "../Signal/Signal";
import { AxiomInterpreter } from "./AxiomInterpreterDatalog";
import { ClassExpressionObservableInterpreter } from "./ClassExpressionObservableInterpreter";
import { ClassExpressionSignalInterpreter } from "./ClassExpressionSignalInterpreter";
import { IClassExpression } from "./IClassExpression";
import { IOntology } from "./IOntology";

export function Test(
    ontology: IOntology,
    store   : IEavStore,
    test    : (
        store           : IEavStore,
        ceInterpretation: (ce: IClassExpression) => ReadonlySet<any>,
        iInterpretation : (i: any) => any
        ) => void
    ): void
{
    {
        const interpreter = new ClassExpressionSignalInterpreter(
            ontology,
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

        test(
            store,
            ceInterpretation,
            null);
    }
    {
        const interpreter = new ClassExpressionObservableInterpreter(
            ontology,
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

        test(
            store,
            ceInterpretation,
            null);
    }
    {
        const rules: Rule[] = [];
        const interpreter = new AxiomInterpreter(
            ontology,
            store,
            rules);
        for (const axiom of ontology.Axioms)
            axiom.Accept(interpreter);

        function ceInterpretation(
            ce: IClassExpression
            ): ReadonlySet<any>
        {
            return new Set(store.Query(['?x'], [[ce.Select(interpreter.ClassExpressionInterpreter), '?x']], ...rules).flat());
        }

        test(
            store,
            ceInterpretation,
            null);
    }
}
