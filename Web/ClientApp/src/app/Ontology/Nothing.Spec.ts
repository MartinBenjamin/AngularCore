import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ReservedVocabulary } from './ReservedVocabulary';

describe(
    "Nothing",
    () =>
    {
        let assert = assertBuilder('Nothing')(ReservedVocabulary.Nothing);
        assert('!Nothing.Evaluate(null, {})');
    });
