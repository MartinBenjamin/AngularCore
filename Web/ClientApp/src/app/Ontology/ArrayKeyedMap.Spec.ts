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
                const entries: [any[], any][] = [[[], 'A'], [[0], 'B'], [[0, 1], 'C'], [[0, 2], 'D']];
                const map = new ArrayKeyedMap(entries);
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

                assert('[...map.keys()].length === 4');
                assert('[...map.keys()].some(key => key.length === [].length && key.every((value, index) => value === [][index]))');
                assert('[...map.keys()].some(key => key.length === [0].length && key.every((value, index) => value === [0][index]))');
                assert('[...map.keys()].some(key => key.length === [0, 1].length && key.every((value, index) => value === [0, 1][index]))');
                assert('[...map.keys()].some(key => key.length === [0, 2].length && key.every((value, index) => value === [0, 2][index]))');
                assert('[...map.values()].length === 4');
                assert('[...map.values()].includes(\'A\')');
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
