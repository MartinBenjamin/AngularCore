import { } from 'jasmine';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectExactCardinality } from './ObjectExactCardinality';
import { ObjectOneOf } from './ObjectOneOf';
import { ObservableGenerator } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty, ObjectProperty } from './Property';

describe(
    'ObjectExactCardinality( n OPE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axiom ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectExactCardinality(op1, 0);
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
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axiom ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectExactCardinality(op1, 1);
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
                            `¬(x ∈ (${classExpressionWriter.Write(ope)})C)`,
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axiom ObjectProperty(op1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectExactCardinality(op1, 2);
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
    'ObjectExactCardinality( n OPE CE ) ({ x | #{ y | ( x , y ) ∈ (OPE)OP and y ∈ (CE)C } = n })',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms ObjectProperty(op1) and NamedIndividual(i):',
            () =>
            {
                const o1 = new Ontology('o1');
                const op1 = new ObjectProperty(o1, 'op1');
                const i = new NamedIndividual(o1, 'i');
                new DataPropertyAssertion(o1, new DataProperty(o1, 'Id'), i, 10);
                const ope = new ObjectExactCardinality(op1, 0, new ObjectOneOf([i]));
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
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
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
                            `¬(x ∈ (${classExpressionWriter.Write(ope)})C)`,
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });
            });

        describe(
            'Given an Ontology o1 with axioms ObjectProperty(op1), NamedIndividual(i1) and NamedIndividual(i2):',
            () =>
            {
                const o1 = new Ontology('o1');
                const id = new DataProperty(o1, 'Id');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                new DataPropertyAssertion(o1, id, i1, 10);
                new DataPropertyAssertion(o1, id, i2, 11);
                const op1 = new ObjectProperty(o1, 'op1');
                const ope = new ObjectExactCardinality(op1, 1, new ObjectOneOf([i1, i2]));
                const generator = new ObservableGenerator(o1);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);

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
                            '¬(x ∈ (${classExpressionWriter.Write(ope)})C)',
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I)}:',
                    () =>
                    {
                        const x = 1;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i1Interpretation]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I), (x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i1Interpretation], [x, y]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i2)I)}:',
                    () =>
                    {
                        const x = 1;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i2Interpretation]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i2)I), (x, y)}:',
                    () =>
                    {
                        const x = 1;
                        const y = 2;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i2Interpretation], [x, y]]);
                        it(
                            `x ∈ (${classExpressionWriter.Write(ope)})C`,
                            () => expect(opeMembers.has(x)).toBe(true));
                        subscription.unsubscribe();
                    });

                describe(
                    'Given (op1)OP = {(x, (i1)I), (x, (i2)I)}:',
                    () =>
                    {
                        const x = 1;
                        let opeMembers: Set<any> = null;
                        const subscription = generator.ClassExpression(ope).subscribe(m => opeMembers = m);
                        generator.ObjectDomain.next(new Set<any>([x]));
                        generator.PropertyExpression(op1).next([[x, i1Interpretation], [x, i2Interpretation]]);
                        it(
                            `¬(x ∈ (${classExpressionWriter.Write(ope)})C)`,
                            () => expect(opeMembers.has(x)).toBe(false));
                        subscription.unsubscribe();
                    });
            });
    });
