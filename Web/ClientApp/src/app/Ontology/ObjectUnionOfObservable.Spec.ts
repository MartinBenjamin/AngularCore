import { } from 'jasmine';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { ObjectUnionOf } from './ObjectUnionOf';
import { IStore, ObservableGenerator, Store } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';
import { IClassExpression } from './IClassExpression';
import { Subscription } from 'rxjs';

describe(
    'ObjectUnionOf( CE1 ... CEn ) ((CE1)C ∪ ... ∪ (CEn)C)',
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
                const ce3 = new ObjectUnionOf([ce1, ce2]);
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);

                function elements(
                    ce: IClassExpression
                    ): Set<any>
                {
                    let subscription: Subscription;
                    try
                    {
                        let members: Set<any> = null;
                        subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                        return members;
                    }
                    finally
                    {
                        subscription.unsubscribe();
                    }
                }

                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(ce1)})C`,
                    () => expect(elements(ce1).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce2)})C)`,
                    () => expect(elements(ce2).has(i1Interpretation)).toBe(false));
                it(
                    `(i1)I ∈ (${classExpressionWriter.Write(ce3)})C`,
                    () => expect(elements(ce3).has(i1Interpretation)).toBe(true));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce1)})C)`,
                    () => expect(elements(ce1).has(i2Interpretation)).toBe(false));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce2)})C`,
                    () => expect(elements(ce2).has(i2Interpretation)).toBe(true));
                it(
                    `(i2)I ∈ (${classExpressionWriter.Write(ce3)})C`,
                    () => expect(elements(ce3).has(i2Interpretation)).toBe(true));
            });
    });
