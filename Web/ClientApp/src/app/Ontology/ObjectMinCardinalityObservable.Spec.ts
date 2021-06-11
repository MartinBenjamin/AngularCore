import { } from 'jasmine';
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectMinCardinality } from './ObjectMinCardinality';
import { Ontology } from "./Ontology";
import { ObjectProperty } from './Property';
import { ObservableGenerator } from './ObservableGenerator';
import { EquivalentClasses } from './EquivalentClasses';

describe(
    'ObjectMinCardinality (Observable)',
    () =>
    {

        describe(
            'Given an Ontology o1 with axioms Class(c1), ObjectProperty(op1) and EquivalentClasses(c1, ObjectMinCardinality(op1, 0)):',
            () =>
            {
                const o1 = new Ontology('o1');
                const c1 = new Class(o1, 'c1');
                const op1 = new ObjectProperty(o1, 'op1');
                new EquivalentClasses(o1, [c1, new ObjectMinCardinality(op1, 0)]);
                const generator = new ObservableGenerator();
                const x = generator.Generate(o1);
                it('Output generated.', () => expect(x).toBeDefined());
                it('There is an observable for c1.', () => expect(x[2].has(c1)).toBe(true));
                it('There is an observable for c1.', () => expect(x[2].get(c1)).toBeDefined());

                describe(
                    'Given an individual i:',
                    () =>
                    {
                        let i = 1;
                        x[0].next([i]);
                        let members: Set<any> = null;
                        let subscription = x[2].get(c1).subscribe(m => members = m);
                        it(
                            'i is a member of c1',
                            () =>
                            {
                                expect(members).toBeDefined();
                                expect(members.has(i)).toBe(true);
                            });

                        members = null;
                        x[1].get('op1').next([[i, 1]]);
                        it(
                            'Given a relation (i, 1) then i is a member of c1',
                            () =>
                            {
                                expect(members).toBeDefined();
                                expect(members.has(i)).toBe(true);
                            });

                        describe(
                            'Given relations (i, 1) and (i, 2) then i is a member of c1',
                            () =>
                            { });
                        subscription.unsubscribe();
                    });
            });
    });
