import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { DataIntersectionOf } from './DataIntersectionOf';
import { DataOneOf } from './DataOneOf';

describe(
    'DataIntersectionOf',
    () =>
    {
        let assert = assertBuilder('DataIntersectionOf', 'DataOneOf')(DataIntersectionOf, DataOneOf);
        assert('!new DataIntersectionOf([new DataOneOf([ 1, 2 ]), new DataOneOf([ 2, 3 ])]).HasMember(1)');
        assert( 'new DataIntersectionOf([new DataOneOf([ 1, 2 ]), new DataOneOf([ 2, 3 ])]).HasMember(2)');
        assert('!new DataIntersectionOf([new DataOneOf([ 1, 2 ]), new DataOneOf([ 2, 3 ])]).HasMember(3)');
    });
