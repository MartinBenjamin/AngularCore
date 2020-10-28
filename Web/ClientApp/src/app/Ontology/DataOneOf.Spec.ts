import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { DataOneOf } from './DataOneOf';

describe(
    'DataOneOf',
    () =>
    {
        let assert = assertBuilder('DataOneOf')(DataOneOf);
        assert('!new DataOneOf([]).HasMember(0)');
        assert('!new DataOneOf([]).HasMember(1)');
        assert('new DataOneOf([ 0 ]).HasMember(0)');
        assert('!new DataOneOf([ 0 ]).HasMember(1)');
        assert('new DataOneOf([ 0, 1 ]).HasMember(0)');
        assert('new DataOneOf([ 0, 1 ]).HasMember(1)');
        assert('!new DataOneOf([ 0, 1 ]).HasMember("0")');
        assert('!new DataOneOf([]).HasMember("")');
        assert('new DataOneOf([ "" ]).HasMember("")');
        assert('!new DataOneOf([ "" ]).HasMember("A")');
    });
