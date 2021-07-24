import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IClassExpression } from './IClassExpression';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { IStore, ObservableGenerator, Store } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty, ObjectProperty } from './Property';

describe(
    'ObjectMinCardinality(n OPE) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ces = [0, 1, 2].map(cardinality => new ObjectMinCardinality(op1, cardinality));
                const store: IStore = new Store();
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

                it(
                    `(${classExpressionWriter.Write(ces[0])})C = ΔI`,
                    () => expect(generator.ClassExpression(ces[0])).toBe(store.Entities));

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        for(const ce of ces)
                            it(
                                ce.Cardinality === 0 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality === 0));
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        store.Add(x, op1.LocalName, y);
                        for(const ce of ces)
                            it(
                                ce.Cardinality <= 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality <= 1));
                    });

                describe(
                    'Given (op1)OP = {(x, y), (x, z)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        const z = 3;
                        store.Add(x, op1.LocalName, y);
                        store.Add(x, op1.LocalName, z);
                        for(const ce of ces)
                            it(
                                ce.Cardinality <= 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(elements(ce).has(x)).toBe(ce.Cardinality <= 2));
                    });
            });
    });
    
describe(
    'ObjectMinCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms ObjectProperty(op1) and NamedIndividual(i):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i = new NamedIndividual(o1, 'i');
                new DataPropertyAssertion(o1, new DataProperty(o1, 'Id'), i, 10);
                const op1 = new ObjectProperty(o1, 'op1');
                const ce = new ObjectMinCardinality(op1, 1, new ObjectOneOf([i]));
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const iInterpretation = generator.InterpretIndividual(i);

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
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        store.Add(x, op1.LocalName, y);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(elements(ce).has(x)).toBe(false));
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, op1.LocalName, iInterpretation);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I), (x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        store.Add(x, op1.LocalName, iInterpretation);
                        store.Add(x, op1.LocalName, y              );
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(elements(ce).has(x)).toBe(true));
                    });
            });
    });
