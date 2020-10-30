import { } from 'jasmine';
import { LongestPaths } from './AdjacencyList';

describe(
    'Adjacency List',
    () =>
    {
        describe(
            'Given A is adjacent to B and C and B is adjacent to D:',
            () =>
            {
                let a = {};
                let b = {};
                let c = {};
                let d = {};
                let adjacencyList = new Map<object, object[]>();
                adjacencyList.set(a, [b, c]);
                adjacencyList.set(b, [d]);
                adjacencyList.set(c, []);
                adjacencyList.set(d, []);

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
                it(
                    'The longest path of D is 0',
                    () => expect(longestPaths.get(d)).toBe(0));
            });
    });
