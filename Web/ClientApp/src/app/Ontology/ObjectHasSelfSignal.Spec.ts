import { } from 'jasmine';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { Signal } from '../Signal/Signal';
import { ClassExpressionSignalInterpreter } from './ClassExpressionSignalInterpreter';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { ObjectHasSelf } from './ObjectHasSelf';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

describe(
    'ObjectHasSelf( OPE ) ({ x | ( x , x ) ∈ (OPE)OP })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1:',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ce = new ObjectHasSelf(op1);
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
                    'Given (op1)OP = {}',
                    () =>
                    {
                        const x = store.NewEntity();
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });

                describe(
                    'Given (op1)OP = {(x, x)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Assert(x, op1.LocalName, x)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });
