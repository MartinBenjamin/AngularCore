import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ArrayKeyedMap } from './ArrayKeyedMap';

describe(
    'ArrayKeyedMap',
    () =>
    {
        describe(
            "Given map = new ArrayKeyedMap([[[], 'A'], [[0], 'B'], [[0, 1], 'C'], [[0, 2], 'D']]):",
            () =>
            {
                const map = new ArrayKeyedMap([[[], 'A'], [[0], 'B'], [[0, 1], 'C'], [[0, 2], 'D']]);
                let assert = assertBuilder('map')(map);
                assert('map.size === 4');
                assert('map.has([])');
                assert('map.get([]) === \'A\'');
                assert('map.has([0])');
                assert('map.get([0]) === \'B\'');
                assert('map.has([0, 1])');
                assert('map.get([0, 1]) === \'C\'');
                assert('map.has([0, 2])');
                assert('map.get([0, 2]) === \'D\'');
                assert('!map.has([0, 3])');
                assert('map.get([0, 3]) === undefined');
                assert('typeof map.get([0, 3]) === \'undefined\'');
                assert('map.get([1, 2]) === undefined');
            });

        describe(
            "Given map = new ArrayKeyedMap() and map.set([0, 1], 'A'):",
            () =>
            {
                const map = new ArrayKeyedMap();
                map.set(
                    [0, 1],
                    'A');
                let assert = assertBuilder('map')(map);
                assert('map.size === 1');
                assert('map.has([0, 1])');
                assert('map.get([0, 1]) === \'A\'');
            });
    });
