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
            'Given ontology o1 which declares c1 with member i1 and c1 as a subclass of c2:',
            () =>
            {
                let o1 = new Ontology('o1');
                let c1 = new Class(o1, 'c1');
                let c2 = new Class(o1, 'c2');
                let i1 = new NamedIndividual(o1, 'i1');
                new SubClassOf(o1, c1, c2);
                new ClassAssertion(o1, c1, i1);

                describe(
                    'Given result = o1.Classify(i1)',
                    () =>
                    {
                        let result = o1.Classify(i1);
                        let assert = assertBuilder('result', 'c1', 'c2', 'i1')(result, c1, c2, i1);
                        assert('result.has(i1)')
                        assert('result.get(i1).size === 2');
                        assert('result.get(i1).has(c1)');
                        assert('result.get(i1).has(c2)');
                    });
            });
    });
