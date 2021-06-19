import { } from 'jasmine';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataExactCardinality } from './DataExactCardinality';
import { DataOneOf } from './DataOneOf';
import { IStore, ObservableGenerator, Store } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';
import { FunctionalDataProperty } from './FunctionalDataProperty';

describe(
    'DataExactCardinality( n DPE ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                const ces = [0, 1, 2].map(cardinality => new DataExactCardinality(dp1, cardinality));
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);

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
                                ce.Cardinality === 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x.Id)).toBe(ce.Cardinality === 1));
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
                        for(const ce of ces)
                        {
                            let members: Set<any> = null;
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality === 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x.Id)).toBe(ce.Cardinality === 2));
                            subscription.unsubscribe();
                        }
                    });
            });

            
        describe(
            'Given an Ontology o1 with axioms DataProperty(dp1) and FunctionalDataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                new FunctionalDataProperty(o1, dp1);
                const ce = new DataExactCardinality(dp1, 1);
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                           `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(members.has(x.Id)).toBe(false));
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
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)DP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 1);
                        store.Add(x, dp1.LocalName, 2);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });
            });
    });

describe(
    'DataExactCardinality( n DPE DR ) ({ x | #{ y | ( x , y ) ∈ (DPE)DP and y ∈ (DR)DT } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                const ce = new DataExactCardinality(dp1, 0, new DataOneOf([1]));
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
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
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
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(members.has(x.Id)).toBe(false));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axiom DataProperty(dp1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const dp1 = new DataProperty(o1, 'dp1');
                const ce = new DataExactCardinality(dp1, 1, new DataOneOf([1, 2]));
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);

                describe(
                    'Given (dp1)OP = {(x, 0)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 3);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(members.has(x.Id)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)OP = {(x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 1);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)OP = {(x, 0), (x, 1)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 0);
                        store.Add(x, dp1.LocalName, 1);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)OP = {(x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 2);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)OP = {(x, 0), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 0);
                        store.Add(x, dp1.LocalName, 2);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x.Id)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (dp1)OP = {(x, 1), (x, 2)}:',
                    () =>
                    {
                        const x = store.NewEntity<any>();
                        store.Add(x, dp1.LocalName, 1);
                        store.Add(x, dp1.LocalName, 2);
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                            () => expect(members.has(x.Id)).toBe(false));
                        subscription.unsubscribe();
                    });
            });
    });
