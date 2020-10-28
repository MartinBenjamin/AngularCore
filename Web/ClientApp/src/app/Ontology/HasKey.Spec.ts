import { } from 'jasmine';
import { Class } from './Class';
import { ClassAssertion, NamedIndividual, DataPropertyAssertion } from './NamedIndividual';
import { Ontology } from './Ontology';
import { DataPropertyExpression } from './Property';

describe(
    "HasKey",
    () =>
    {
        describe(
            'Given an Ontology o1 which declares Class c1 with member i1, DataPropertyExpression dpe1 and HasKey(c1, [ dpe1 ]): ',
            () =>
            {
                let o1 = new Ontology('o1');
                let c1 = new Class(o1, 'c1');
                let i1 = new NamedIndividual(o1, 'i1');
                new ClassAssertion(o1, c1, i1);
                let dpe1 = new DataPropertyExpression(o1, 'dpe1');
                new DataPropertyAssertion(o1, dpe1, i1, 1);

            });
    });
