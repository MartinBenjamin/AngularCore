import { } from 'jasmine';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty, ObjectProperty } from './Property';

describe(
    'ObjectMinCardinality(n OPE) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectMinCardinality(op1, 0);
                const generator = new ObservableGenerator(o1);

                it(
                    `(${classExpressionWriter.Write(ope)})C = ΔI`,
                    () => expect(generator.ClassExpression(ope)).toBe(generator.ObjectDomain));

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = 1;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectMinCardinality(op1, 1);
                const generator = new ObservableGenerator(o1);

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = 1;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ope)})C)`,
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, y]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectMinCardinality(op1, 2);
                const generator = new ObservableGenerator(o1);

                describe(
                    'Given x ∈ ΔI:',
                    () =>
                    {
                        const x = 1;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ope)})C)`,
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, y]]);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ope)})C)`,
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, y), (x, z)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        const z = 3;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, y], [x, z]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });
    });
    
describe(
    'ObjectMinCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } ≥ n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1), NamedIndividual(i):',
            () =>
            {
                const o1 = new Ontology('o1');
                const i = new NamedIndividual(o1, 'i');
                new DataPropertyAssertion(o1, new DataProperty(o1, 'Id'), i, 10);
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectMinCardinality(op1, 1, new ObjectOneOf([i]));
                const generator = new ObservableGenerator(o1);
                const iInterpretation = generator.InterpretIndividual(i);

                describe(
                    'Given (op1)OP = {(x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, y]]);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ope)})C)`,
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I)}:',
                    () =>
                    {
                        const x = 1;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, iInterpretation]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i)I), (x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, iInterpretation], [x, y]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });
    });
