import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Thing } from './Thing';

describe(
    "Thing",
    () =>
    {
        let assert = assertBuilder('Thing')(Thing);
        assert('Thing.Iri === "http://www.w3.org/2002/07/owl#Thing"');
        assert('Thing.Evaluate(null, {})');
    });
