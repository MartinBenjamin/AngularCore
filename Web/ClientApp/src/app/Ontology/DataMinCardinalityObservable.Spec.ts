import { } from 'jasmine';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { IStore, ObservableGenerator, Store } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty, ObjectProperty } from './Property';
import { DataMinCardinality } from './DataMinCardinality';
import { DataOneOf } from './DataOneOf';

describe(
    'DataMinCardinality( n DPE ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP} ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                const ces = [0, 1, 2].map(cardinality => new DataMinCardinality(dp1, cardinality));
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);

                it(
                    `(${classExpressionWriter.Write(ces[0])})C = ΔI`,
                    () => expect(generator.ClassExpression(ces[0])).toBe(store.ObjectDomain));

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
                                () => expect(members.has(x)).toBe(ce.Cardinality === 0));
                            subscription.unsubscribe();
                        }
                    });

                describe(
                    'Given (dp1)DP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 1);
                        for(const ce of ces)
                        {
                            let members: Set<any> = null;
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality <= 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x)).toBe(ce.Cardinality <= 1));
                            subscription.unsubscribe();
                        }
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 1);
                        store.Add(x, dp1.LocalName, 2);
                        let members: Set<any> = null;
                        for(const ce of ces)
                        {
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality <= 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x)).toBe(ce.Cardinality <= 2));
                            subscription.unsubscribe();
                        }
                    });
            });
    });

describe(
    'DataMinCardinality( n DPE DR ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP and y ∈ (DR)DT } ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                const ce = new DataMinCardinality(dp1, 1, new DataOneOf([1]));
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);

                describe(
                    'Given (dp1)DP = {(x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 2);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(members.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)DP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 1);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        const y = 2;
                        store.Add(x, dp1.LocalName, 1);
                        store.Add(x, dp1.LocalName, 2);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });
    });
