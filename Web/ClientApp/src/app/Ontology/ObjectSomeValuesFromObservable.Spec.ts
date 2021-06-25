import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';
import { IStore, ObservableGenerator, Store } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty, ObjectProperty } from './Property';

describe(
    'ObjectSomeValuesFrom( OPE CE ) ({ x | ∃ y : ( x, y ) ∈ (OPE)OP and y ∈ (CE)C })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms NamedIndividual(i1), NamedIndividual(i2) and  NamedIndividual(i1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const id = new DataProperty(o1, 'Id');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                const i3 = new NamedIndividual(o1, 'i3');
                new DataPropertyAssertion(o1, id, i1, 1);
                new DataPropertyAssertion(o1, id, i2, 2);
                new DataPropertyAssertion(o1, id, i3, 3);
                const ce = new ObjectSomeValuesFrom(op1, new ObjectOneOf([i1, i2]));
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);
                const i3Interpretation = generator.InterpretIndividual(i3);

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
                        const x = store.NewEntity<any>();
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });

                describe(
                    'Given (op1)OP = {(x, i1)}',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, op1.LocalName, i1Interpretation)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i2)}',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, op1.LocalName, i2Interpretation)
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, i3)}',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, op1.LocalName, i3Interpretation)
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });
            });
    });
