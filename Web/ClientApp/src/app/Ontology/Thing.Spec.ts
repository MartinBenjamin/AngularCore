import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ReservedVocabulary } from './ReservedVocabulary';

describe(
    "Thing",
    () =>
    {
        let assert = assertBuilder('Thing')(ReservedVocabulary.Thing);
        assert('Thing.Iri === "http://www.w3.org/2002/07/owl#Thing"');
        assert('Thing.Evaluate(null, {})');
    });
