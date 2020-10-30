import { } from 'jasmine';
import { LongestPaths } from './AdjacencyList';

describe(
    'Given A is adjacent to B and B is adjacent to C:',
    () =>
    {
        let a = {};
        let b = {};
        let c = {};
        let adjacencyList = new Map<object, object[]>();
        adjacencyList.set(a, [b]);
        adjacencyList.set(b, [c]);
        adjacencyList.set(c, []);

        let longestPaths = LongestPaths(adjacencyList);
        it(
            'The longest path of A is 2',
            () => expect(longestPaths.get(a)).toBe(2));
        it(
            'The longest path of B is 1',
            () => expect(longestPaths.get(b)).toBe(1));
        it(
            'The longest path of C is 0',
            () => expect(longestPaths.get(c)).toBe(0));
    });
