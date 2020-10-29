import { } from 'jasmine';
import { Class } from './Class';
import { ClassAssertion, NamedIndividual, DataPropertyAssertion } from './NamedIndividual';
import { Ontology } from './Ontology';
import { DataPropertyExpression } from './Property';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { assertBuilder } from './assertBuilder';
import { HasKey } from './HasKey';

describe(
    "HasKey",
    () =>
    {
        describe(
            'Given an Ontology o1 with declarations Class(c1), NamedIndividual(i1), ClassAssertion(c1, i1), DataPropertyExpression(dpe1)) and DataPropertyAssertion(dpe1, i1, 1): ',
            () =>
            {
                let o1 = new Ontology('o1');
                let c1 = new Class(o1, 'c1');
                let i1 = new NamedIndividual(o1, 'i1');
                new ClassAssertion(o1, c1, i1);
                let dpe1 = new DataPropertyExpression(o1, 'dpe1');
                new DataPropertyAssertion(o1, dpe1, i1, 1);
                let evaluator = new ClassMembershipEvaluator(o1);
                let assert = assertBuilder('evaluator', 'i1')(evaluator, i1);
                assert('!evaluator.AreEqual(i1, i1)');

                describe(
                    'Given additional declaration HasKey(c1, [ dpe1 ]): ',
                    () =>
                    {
                        new HasKey(o1, c1, [dpe1]);
                        evaluator = new ClassMembershipEvaluator(o1);
                        let assert = assertBuilder('evaluator', 'i1')(evaluator, i1);
                        assert('evaluator.AreEqual(i1, i1)');
                        assert('!evaluator.AreEqual(i1, {})');
                        assert('!evaluator.AreEqual(i1, { ClassIri: "o1.c1", dpe1: 0 })');
                        assert('evaluator.AreEqual(i1, { ClassIri: "o1.c1", dpe1: 1 })');
                        assert('evaluator.AreEqual(i1, { ClassIri: "o1.c1", dpe1: [ 1 ] })');
                        assert('!evaluator.AreEqual(i1, { ClassIri: "o1.c1", dpe1: [ 1, 2 ] })');

                        describe(
                            'Given additional declaration DataPropertyAssertion(dpe1, i1, 2):',
                            () =>
                            {
                                new DataPropertyAssertion(o1, dpe1, i1, 2);
                                evaluator = new ClassMembershipEvaluator(o1);
                                let assert = assertBuilder('evaluator', 'i1')(evaluator, i1);
                                assert('!evaluator.AreEqual(i1, { ClassIri: "o1.c1", dpe1: [ 1 ] })');
                                assert('evaluator.AreEqual(i1, { ClassIri: "o1.c1", dpe1: [ 1, 2 ] })');
                                assert('evaluator.AreEqual(i1, { ClassIri: "o1.c1", dpe1: [ 2, 1 ] })');
                            });
                    });
            });
    });
