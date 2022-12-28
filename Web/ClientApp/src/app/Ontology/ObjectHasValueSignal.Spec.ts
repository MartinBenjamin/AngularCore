import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { EavStore } from './EavStore';
import { IClassExpression } from './IClassExpression';
import { IEavStore } from './IEavStore';
import { NamedIndividual } from './NamedIndividual';
import { ObjectHasValue } from './ObjectHasValue';
import { ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { Signal } from '../Signal';

describe(
    'ObjectHasValue( OPE a ) ({ x | ( x , (a)I ) ∈ (OPE)OP })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom NamedIndividual(i1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const i1 = new NamedIndividual(o1, 'i1');
                const ce = new ObjectHasValue(op1, i1);
                const store: IEavStore = new EavStore();
                const interpreter = new ClassExpressionSignalInterpreter(
                    o1,
                    store);
                const i1Interpretation = interpreter.InterpretIndividual(i1);

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
                    'Given (op1)OP = {}',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });

                describe(
                    'Given (op1)OP = {(x, i1)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, i1Interpretation)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });
