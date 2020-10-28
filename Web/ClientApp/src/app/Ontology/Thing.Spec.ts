import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ReservedVocabulary } from './ReservedVocabulary';

describe(
    "Thing",
    () =>
    {
        let assert = assertBuilder('Thing')(ReservedVocabulary.Thing);
        assert('Thing.Evaluate(null, {})');
    });
