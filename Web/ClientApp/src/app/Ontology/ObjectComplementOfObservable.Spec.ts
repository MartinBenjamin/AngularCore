import { } from 'jasmine';
import { ObjectComplementOf } from './ClassExpression';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { IStore, ObservableGenerator, Store } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'ObjectComplementOf( CE ) (ΔI \ (CE)C)',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms NamedIndividual(i1) and NamedIndividual(i2):',
            () =>
            {
                const o1 = new Ontology('o1');
                const id = new DataProperty(o1, 'Id');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                new DataPropertyAssertion(o1, id, i1, 1);
                new DataPropertyAssertion(o1, id, i2, 2);
                const ce1 = new ObjectOneOf([i1]);
                const ce2 = new ObjectOneOf([i2]);
                const ce1Complement = new ObjectComplementOf(ce1);
                const ce2Complement = new ObjectComplementOf(ce2);
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);


                let ce1Members          : Set<any> = null;
                let ce2Members          : Set<any> = null;
                let ce1ComplementMembers: Set<any> = null;
                let ce2ComplementMembers: Set<any> = null;
                const subscriptions =
                    [
                        generator.ClassExpression(ce1          ).subscribe(m => ce1Members           = m),
                        generator.ClassExpression(ce2          ).subscribe(m => ce2Members           = m),
                        generator.ClassExpression(ce1Complement).subscribe(m => ce1ComplementMembers = m),
                        generator.ClassExpression(ce2Complement).subscribe(m => ce2ComplementMembers = m)
                    ];

                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(ce1)})C`,
                    () => expect(ce1Members.has(i1Interpretation)).toBe(true));
                it(
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce2)})C)`,
                    () => expect(ce2Members.has(i1Interpretation)).toBe(false));
                it(
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce1Complement)})C)`,
                    () => expect(ce1ComplementMembers.has(i1Interpretation)).toBe(false));
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(ce2Complement)})C`,
                    () => expect(ce2ComplementMembers.has(i1Interpretation)).toBe(true));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce2)})C`,
                    () => expect(ce2Members.has(i2Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce1)})C)`,
                    () => expect(ce1Members.has(i2Interpretation)).toBe(false));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce2Complement)})C)`,
                    () => expect(ce2ComplementMembers.has(i2Interpretation)).toBe(false));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce1Complement)})C`,
                    () => expect(ce1ComplementMembers.has(i2Interpretation)).toBe(true));

                subscriptions.forEach(subscription => subscription.unsubscribe());
        });
    });
