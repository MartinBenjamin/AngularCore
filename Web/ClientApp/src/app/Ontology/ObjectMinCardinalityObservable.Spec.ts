import { } from 'jasmine';
import { ClassExpressionWriter } from './ClassExpressionWriter';
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

                it(
                    `(${classExpressionWriter.Write(ces[0])})C = ΔI`,
                    () => expect(generator.ClassExpression(ces[0])).toBe(generator.ObjectDomain));

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        for(const ce of ces)
                        {
                            let members: Set<any> = null;
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality === 0 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x.Id)).toBe(ce.Cardinality === 0));
                            subscription.unsubscribe();
                        }
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        store.AddValue(x, op1.LocalName, y);
                        for(const ce of ces)
                        {
                            let members: Set<any> = null;
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality <= 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x.Id)).toBe(ce.Cardinality <= 1));
                            subscription.unsubscribe();
                        }
                    });

                describe(
                    'Given (op1)OP = {(x, y), (x, z)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        const z = 3;
                        store.AddValue(x, op1.LocalName, y);
                        store.AddValue(x, op1.LocalName, z);
                        let members: Set<any> = null;
                        for(const ce of ces)
                        {
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality <= 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x.Id)).toBe(ce.Cardinality <= 2));
                            subscription.unsubscribe();
                        }
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

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        store.AddValue(x, op1.LocalName, y);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(members.has(x.Id)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.AddValue(x, op1.LocalName, iInterpretation);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I), (x, y)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        store.AddValue(x, op1.LocalName, iInterpretation);
                        store.AddValue(x, op1.LocalName, y              );
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });
            });
    });
