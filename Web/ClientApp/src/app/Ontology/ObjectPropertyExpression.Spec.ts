import { } from 'jasmine';
import { Ontology } from "./Ontology";
import { IOntology } from "./IOntology";
import { Class } from "./Class";
import { IClass } from "./IClass";
import { IObjectPropertyExpression } from './IPropertyExpression';
import { ObjectPropertyAssertion } from './NamedIndividual';
import { ObjectPropertyExpression } from './Property';

describe(
    'ObjectPropertyExpression',
    () =>
    {
        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');

                describe(
                    'Given o1 declares ObjectPropertyExpression ope1:',
                    () =>
                    {
                        let ope1: IObjectPropertyExpression = new ObjectPropertyExpression(o1, 'ope1');
                        it(
                            'ope1.Ontology === o1',
                            () => expect(ope1.Ontology).toBe(o1));
                        it(
                            'o1.Axioms.includes(ope1)',
                            () => expect(o1.Axioms.includes(ope1)).toBe(true));
                        it(
                            'Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)',
                            () => expect(Array.from(o1.Get<IObjectPropertyExpression>(o1.IsAxiom.IObjectPropertyExpression)).includes(ope1)).toBe(true));
                    });
            });
    });
