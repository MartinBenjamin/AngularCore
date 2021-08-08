import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { NamedIndividual } from './NamedIndividual';
import { ObjectHasValue } from './ObjectHasValue';
import { EavStore, IEavStore, ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';

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
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);

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
                    'Given (op1)OP = {(x, i1)}',
                    () =>
                    {
                        const x = store.NewEntity();
                        store.Add(x, op1.LocalName, i1Interpretation)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });
