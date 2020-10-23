import { Ontology } from "./Ontology";
import { IOntology } from "./IOntology";
import { Class } from "./Class";
import { IClass } from "./IClass";

let Assert =
{
    True: function(
        booleanExpression: string
        )
    {
        it(
            booleanExpression,
            () =>
            {
                expect(eval(booleanExpression)).toBe(true);
            });
    }

    StrictEquals: function(
        lhs,
        rhs
        )
    {
        it(
            lhs + ' === ' + rhs,
            () =>
            {
                expect(eval(lhs)).toBe(eval(rhs));
            });
    }
};

describe(
    'Ontology',
    () =>
    {
        let ontologyIris =
            [
                'O1',
                'O2',
                'O3'
            ];

        for(let iri of ontologyIris)
            describe(
                `Given an Ontology o constructed with IRI: '${iri}':`,
                () => it(
                    `o.Iri === '${iri}'`,
                    () => expect(new Ontology(iri).Iri).toBe(iri)));

        describe(
            'Given an Ontology o1:',
            () =>
            {
                let o1: IOntology = new Ontology('o1');
                it(
                    `Array.from(o1.GetOntologies()).includes(o1)`,
                    () => expect(Array.from(o1.GetOntologies()).includes(o1)).toBe(true));

                describe(
                    'Given an Ontology o2 which imports o1:',
                    () =>
                    {
                        let o2: IOntology = new Ontology('o2', o1);
                        it(
                            `Array.from(o2.GetOntologies()).includes(o1)`,
                            () => expect(Array.from(o2.GetOntologies()).includes(o1)).toBe(true));

                        describe(
                            'Given an Ontology o3 which imports o2:',
                            () =>
                            {
                                let o3 = new Ontology('o3', o2);
                                it(
                                    `Array.from(o3.GetOntologies()).includes(o2)`,
                                    () => expect(Array.from(o3.GetOntologies()).includes(o2)).toBe(true));

                                it(
                                    `Array.from(o3.GetOntologies()).includes(o1)`,
                                    () => expect(Array.from(o3.GetOntologies()).includes(o1)).toBe(true));
                            });


                        describe(
                            'Given an Ontology o3 which imports o1 and o2:',
                            () =>
                            {
                                let o3: IOntology = new Ontology('', o1, o2);
                                it(
                                    `Array.from(o3.GetOntologies()).filter(o => o === o1).length === 1`,
                                    () => expect(Array.from(o3.GetOntologies()).filter(o => o === o1).length).toBe(1));
                            });
                    });

                describe(
                    'Given o1 declares Class c1:',
                    () =>
                    {
                        let c1: IClass = new Class(o1, 'c1');
                        it(
                            'Array.from(o1.Get<IClass>(o1.IsAxiom.IClass)).filter(c => c === c1).length === 1',
                            () => expect(Array.from(o1.Get<IClass>(o1.IsAxiom.IClass)).filter(c => c === c1).length).toBe(1);
                    })
            });
    });
