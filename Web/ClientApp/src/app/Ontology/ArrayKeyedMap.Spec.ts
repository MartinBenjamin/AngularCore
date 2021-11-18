import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ArrayKeyedMap } from './ArrayKeyedMap';

describe(
    'ArrayKeyedMap',
    () =>
    {
        describe(
            "Given entries: [any[], any][] = [[[], 'A'], [[0], 'B'], [[0, 1], 'C'], [[0, 2], 'D']] and map = new ArrayKeyedMap(entries):",
            () =>
            {
                const entries: [any[], any][] = [[[], 'A'], [[0], 'B'], [[0, 1], 'C'], [[0, 2], 'D']];
                const map = new ArrayKeyedMap(entries);
                let assert = assertBuilder('entries', 'map')(entries, map);
                assert('map.size === entries.length');
                assert('entries.every(entry => map.has(entry[0]))');
                assert('entries.every(entry => map.get(entry[0]) === entry[1])');
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

                assert('[...map.keys()].length === entries.length');
                assert('[...map.keys()].every(key => entries.some(entry => key.length === entry[0].length && key.every((value, index) => value === entry[0][index])))');
                assert('[...map.keys()].some(key => key.length === [].length && key.every((value, index) => value === [][index]))');
                assert('[...map.keys()].some(key => key.length === [0].length && key.every((value, index) => value === [0][index]))');
                assert('[...map.keys()].some(key => key.length === [0, 1].length && key.every((value, index) => value === [0, 1][index]))');
                assert('[...map.keys()].some(key => key.length === [0, 2].length && key.every((value, index) => value === [0, 2][index]))');

                assert('[...map.values()].length === entries.length');
                assert('[...map.values()].every(value => entries.map(entry => entry[1]).includes(value))');
                assert('[...map.values()].includes(\'A\')');
                assert('[...map.values()].includes(\'B\')');
                assert('[...map.values()].includes(\'C\')');
                assert('[...map.values()].includes(\'D\')');
                assert('![...map.values()].includes(\'E\')');

                assert('[...map.entries()].length === entries.length');
                assert('[...map.entries()].every(entry0 => entries.some(entry1 => entry0[0].length === entry1[0].length && entry0[0].every((value, index) => value === entry1[0][index]) && entry0[1] === entry1[1]))');
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
