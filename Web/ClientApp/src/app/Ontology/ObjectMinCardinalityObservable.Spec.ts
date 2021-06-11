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
                describe(
                    'Given an individual i:',
                    () =>
                    {
                        //x[]
                        describe(
                            'i is a member of c1',
                            () =>
                            { });

                        describe(
                            'Given a relation (i, 1) then i is a member of c1',
                            () =>
                            { });

                        describe(
                            'Given relations (i, 1) and (i, 2) then i is a member of c1',
                            () =>
                            { });
                    });
            });
    });
