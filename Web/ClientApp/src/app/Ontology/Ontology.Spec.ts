import { Ontology } from "./Ontology";
import { IOntology } from "./IOntology";

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
                let o1 = new Ontology('');
                it(
                    `Array.from(o1.GetOntologies()).includes(o1)`,
                    () =>
                    {
                        expect(Array.from(o1.GetOntologies()).includes(o1)).toBe(true);
                    });

                describe(
                    'Given an Ontology o2 which imports o1:',
                    () =>
                    {
                        let o2 = new Ontology('', o1);
                        it(
                            `Array.from(o2.GetOntologies()).includes(o1)`,
                            () =>
                            {
                                expect(Array.from(o2.GetOntologies()).includes(o1)).toBe(true);
                            });

            });
    });
