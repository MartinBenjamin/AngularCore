import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ReservedVocabulary } from './ReservedVocabulary';

describe(
    "Nothing",
    () =>
    {
        let assert = assertBuilder('Nothing')(ReservedVocabulary.Nothing);
        assert('Nothing.Iri === "http://www.w3.org/2002/07/owl#Nothing"');
        assert('!Nothing.Evaluate(null, {})');
    });
