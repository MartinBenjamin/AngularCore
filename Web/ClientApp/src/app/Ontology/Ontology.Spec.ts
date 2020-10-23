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
                `Given an Ontology O constructed with IRI: '${iri}'.`,
                () => it(
                    `O.Iri === '${iri}'`,
                    () => expect(new Ontology(iri).Iri).toBe(iri)));

        describe(
            'Given an Ontology O',
            () => it(
                `Array.from(O.GetOntologies()).includes(O)`,
                () =>
                {
                    let ontology = new Ontology('');
                    expect(Array.from(ontology.GetOntologies()).includes(ontology)).toBe(true);
                });
    });
