import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ReservedVocabulary } from './ReservedVocabulary';

describe(
    "Thing",
    () =>
    {
        let assert = assertBuilder('ReservedVocabulary')(ReservedVocabulary);
        assert('ReservedVocabulary.Thing.Evaluate(null, {})');
    });
