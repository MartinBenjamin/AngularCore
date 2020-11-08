import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Class } from './Class';
import { ClassAssertion, NamedIndividual } from './NamedIndividual';
import { Ontology } from './Ontology';
import { SubClassOf } from './SubClassOf';

describe(
    'SubClassOf',
    () =>
    {
        describe(
            'Given ontology o1 which declares c1 with member i1, c1 as a subclass of c2 and c2 as a subclass of c3:',
            () =>
            {
                let o1 = new Ontology('o1');
                let c1 = new Class(o1, 'c1');
                let c2 = new Class(o1, 'c2');
                let c3 = new Class(o1, 'c3');
                let i1 = new NamedIndividual(o1, 'i1');
                new SubClassOf(o1, c1, c2);
                new SubClassOf(o1, c2, c3);
                new ClassAssertion(o1, c1, i1);

                describe(
                    'Given result = o1.SuperClasses(c1)',
                    () =>
                    {
                        let result = o1.SuperClasses(c1);
                        let assert = assertBuilder('result', 'c1', 'c2', 'c3')(result, c1, c2, c3);
                        assert('result.size === 3')
                        assert('result.has(c1)');
                        assert('result.has(c2)');
                        assert('result.has(c3)');
                    });

                describe(
                    'Given result = o1.SuperClasses(c2)',
                    () =>
                    {
                        let result = o1.SuperClasses(c2);
                        let assert = assertBuilder('result', 'c1', 'c2', 'c3')(result, c1, c2, c3);
                        assert('result.size === 2')
                        assert('!result.has(c1)');
                        assert('result.has(c2)');
                        assert('result.has(c3)');
                    });

                describe(
                    'Given result = o1.SuperClasses(c3)',
                    () =>
                    {
                        let result = o1.SuperClasses(c3);
                        let assert = assertBuilder('result', 'c1', 'c2', 'c3')(result, c1, c2, c3);
                        assert('result.size === 1')
                        assert('!result.has(c1)');
                        assert('!result.has(c2)');
                        assert('result.has(c3)');
                    });

                describe(
                    'Given result = o1.Classify(i1)',
                    () =>
                    {
                        let result = o1.Classify(i1);
                        let assert = assertBuilder('result', 'c1', 'c2', 'c3', 'i1')(result, c1, c2, c3, i1);
                        assert('result.has(i1)')
                        assert('result.get(i1).size === 3');
                        assert('result.get(i1).has(c1)');
                        assert('result.get(i1).has(c2)');
                        assert('result.get(i1).has(c3)');
                    });
            });
    });
