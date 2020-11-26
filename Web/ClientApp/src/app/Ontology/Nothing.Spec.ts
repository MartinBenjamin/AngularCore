import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Nothing } from './Nothing';

describe(
    "Nothing",
    () =>
    {
        let assert = assertBuilder('Nothing')(Nothing);
        assert('Nothing.Iri === "http://www.w3.org/2002/07/owl#Nothing"');
        assert('!Nothing.Evaluate(null, {})');
    });
