import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { DataOneOf } from './DataOneOf';
import { DataUnionOf } from './DataUnionOf';

describe(
    'DataUnionOf',
    () =>
    {
        let assert = assertBuilder('DataUnionOf', 'DataOneOf')(DataUnionOf, DataOneOf);
        assert('new DataUnionOf([new DataOneOf([ 1, 2 ]), new DataOneOf([ 2, 3 ])]).HasMember(1)');
        assert('new DataUnionOf([new DataOneOf([ 1, 2 ]), new DataOneOf([ 2, 3 ])]).HasMember(2)');
        assert('new DataUnionOf([new DataOneOf([ 1, 2 ]), new DataOneOf([ 2, 3 ])]).HasMember(3)');
    });
