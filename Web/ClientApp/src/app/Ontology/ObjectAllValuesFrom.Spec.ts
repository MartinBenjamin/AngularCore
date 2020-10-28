import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassMembershipEvaluator } from './ClassMembershipEvaluator';
import { IClassExpression } from './IClassExpression';
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { ObjectAllValuesFrom } from './ObjectAllValuesFrom';
import { ObjectSomeValuesFrom } from './ObjectSomeValuesFrom';
import { Ontology } from "./Ontology";
import { ObjectPropertyExpression } from './Property';

describe(
    'ObjectAllValuesFrom',
    () =>
    {
        describe(
            'Given an Ontology o1 which declares ObjectPropertyExpression ope1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');
                let ope1: IObjectPropertyExpression = new ObjectPropertyExpression(o1, 'ope1');
                describe(
                    `Given o1 declares individuals i1, i2, i3 and Class c1 with members i1 and i3:`,
                    () =>
                    {
                        let c1 = new Class(o1, 'c1');
                        let i1 = new NamedIndividual(o1, 'i1');
                        let i2 = new NamedIndividual(o1, 'i2');
                        let i3 = new NamedIndividual(o1, 'i2');
                        new ClassAssertion(o1, c1, i1);
                        new ClassAssertion(o1, c1, i3);
                        let evaluator = new ClassMembershipEvaluator(o1, new Map<object, Set<IClassExpression>>());
                        let assert = assertBuilder('evaluator', 'ObjectAllValuesFrom', 'ope1', 'c1', 'i1', 'i2', 'i3')
                            (evaluator, ObjectAllValuesFrom, ope1, c1, i1, i2, i3);
                        new ObjectSomeValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [i1] })
                        assert('new ObjectAllValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: []})');
                        assert('new ObjectAllValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1 ] })');
                        assert('new ObjectAllValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i3 ] })');
                        assert('new ObjectAllValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1, i3 ] })');
                        assert('new ObjectAllValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i1, i2 ] }) == false');
                        assert('new ObjectAllValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i2, i3 ] }) == false');
                        assert('new ObjectAllValuesFrom(ope1, c1).Evaluate(evaluator, { ope1: [ i2 ] }) === false');
                    });
            });
    });
