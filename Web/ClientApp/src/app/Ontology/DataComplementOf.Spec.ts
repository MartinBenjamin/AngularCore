import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { DataOneOf } from './DataOneOf';
import { DataComplementOf } from './DataComplementOf';

describe(
    'DataComplementOf',
    () =>
    {
        let assert = assertBuilder('DataComplementOf', 'DataOneOf')(DataComplementOf, DataOneOf);
        assert('new DataComplementOf(new DataOneOf([])).HasMember(0)');
        assert('new DataComplementOf(new DataOneOf([])).HasMember(1)');
        assert('!new DataComplementOf(new DataOneOf([ 0 ])).HasMember(0)');
        assert('new DataComplementOf(new DataOneOf([ 0 ])).HasMember(1)');
        assert('!new DataComplementOf(new DataOneOf([ 0, 1 ])).HasMember(0)');
        assert('!new DataComplementOf(new DataOneOf([ 0, 1 ])).HasMember(1)');
        assert('!new DataComplementOf(new DataOneOf([ "" ])).HasMember("")');
        assert('new DataComplementOf(new DataOneOf([ "" ])).HasMember("A")');
    });
