import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassExpressionObservableInterpreter } from './ClassExpressionObservableInterpreter';
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
                const generator = new ClassExpressionObservableInterpreter(
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
