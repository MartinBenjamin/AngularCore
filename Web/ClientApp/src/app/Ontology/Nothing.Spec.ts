import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ReservedVocabulary } from './ReservedVocabulary';

describe(
    "Nothing",
    () =>
    {
        let assert = assertBuilder('ReservedVocabulary')(ReservedVocabulary);
        assert('!ReservedVocabulary.Nothing.Evaluate(null, {})');
    });
