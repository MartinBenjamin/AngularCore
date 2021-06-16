import { } from 'jasmine';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMaxCardinality } from './ObjectMaxCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty, ObjectProperty } from './Property';

describe(
    'ObjectMaxCardinality( n OPE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } ≤ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ces = [0, 1, 2].map(cardinality => new ObjectMaxCardinality(op1, cardinality));
                const generator = new ObservableGenerator(o1);

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = 1;
                        generator.ObjectDomain.next(new Set<any>([x]));
                        for(const ce of ces)
                        {
                            let members: Set<any> = null;
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality === 0 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x)).toBe(ce.Cardinality >= 0));
                            subscription.unsubscribe();
                        }
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, y]]);
                        for(const ce of ces)
                        {
                            let members: Set<any> = null;
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality === 1 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x)).toBe(ce.Cardinality >= 1));
                            subscription.unsubscribe();
                        }
                    });

                describe(
                    'Given (op1)OP = {(x, y), (x, z)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        const z = 3;
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, y], [x, z]]);
                        for(const ce of ces)
                        {
                            let members: Set<any> = null;
                            const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                            it(
                                ce.Cardinality === 2 ?
                                    `x ∈ (${classExpressionWriter.Write(ce)})C` : `¬(x ∈ (${classExpressionWriter.Write(ce)})C)`,
                                () => expect(members.has(x)).toBe(ce.Cardinality >= 2));
                            subscription.unsubscribe();
                        }
                    });
            });
    });

describe(
    'ObjectMaxCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } ≤ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1), NamedIndividual(i1) and NamedIndividual(i2):',
            () =>
            {
                const o1 = new Ontology('o1');
                const id = new DataProperty(o1, 'Id');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                new DataPropertyAssertion(o1, id, i1, 10);
                new DataPropertyAssertion(o1, id, i2, 11);
                const op1 = new ObjectProperty(o1, 'op1');
                const ce = new ObjectMaxCardinality(op1, 1, new ObjectOneOf([i1, i2]));
                const generator = new ObservableGenerator(o1);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, y]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I)}:',
                    () =>
                    {
                        const x = 1;
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i1Interpretation]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I), (x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i1Interpretation], [x, y]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i2)I)}:',
                    () =>
                    {
                        const x = 1;
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i2Interpretation]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i2)I), (x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i2Interpretation], [x, y]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ce)})C`,
                            () => expect(members.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I), (x, (i2)I)}:',
                    () =>
                    {
                        const x = 1;
                        let members: Set<any> = null;
                        const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i1Interpretation], [x, i2Interpretation]]);
                        it(
                            '¬(x ∈ (${classExpressionWriter.Write(ce)})C)',
                            () => expect(members.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });
            });
    });
