import { } from 'jasmine';
import { ObjectIntersectionOf } from './ClassExpression';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { DataPropertyAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectOneOf } from './ObjectOneOf';
import { IStore, ObservableGenerator, Store } from './ObservableGenerator';
import { Ontology } from "./Ontology";
import { DataProperty } from './Property';

describe(
    'ObjectIntersectionOf( CE1 ... CEn ) ((CE1)C ∩ ... ∩ (CEn)C)',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o1 with axioms NamedIndividual(i1), NamedIndividual(i2) and  NamedIndividual(i1):',
            () =>
            {
                const o1 = new Ontology('o1');
                const id = new DataProperty(o1, 'Id');
                const i1 = new NamedIndividual(o1, 'i1');
                const i2 = new NamedIndividual(o1, 'i2');
                const i3 = new NamedIndividual(o1, 'i3');
                new DataPropertyAssertion(o1, id, i1, 1);
                new DataPropertyAssertion(o1, id, i2, 2);
                new DataPropertyAssertion(o1, id, i2, 3);
                const ce = new ObjectIntersectionOf([new ObjectOneOf([i1, i3]), new ObjectOneOf([i2, i3])]);
                const store: IStore = new Store();
                const generator = new ObservableGenerator(
                    o1,
                    store);
                const i1Interpretation = generator.InterpretIndividual(i1);
                const i2Interpretation = generator.InterpretIndividual(i2);
                const i3Interpretation = generator.InterpretIndividual(i3);

                let members: Set<any> = null;
                const subscription = generator.ClassExpression(ce).subscribe(m => members = m);
                it(
                    `¬((i1)I ∈ (${classExpressionWriter.Write(ce)})C)`,
                    () => expect(members.has(i1Interpretation)).toBe(false));
                it(
                    `¬((i2)I ∈ (${classExpressionWriter.Write(ce)})C)`,
                    () => expect(members.has(i2Interpretation)).toBe(false));
                it(
                    `(i3)I ∈ (${classExpressionWriter.Write(ce)})C`,
                    () => expect(members.has(i3Interpretation)).toBe(true));
                subscription.unsubscribe();
            });
    });
