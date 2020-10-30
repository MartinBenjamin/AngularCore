import { } from 'jasmine';
import { LongestPaths, TopologicalSort } from './AdjacencyList';

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


        describe(
            'Given A is adjacent to B and B is adjacent to C:',
            () =>
            {
                let adjacencyList = new Map<number, number[]>();
                adjacencyList.set(1, [2]);
                adjacencyList.set(2, [3]);
                adjacencyList.set(3, []);

                it(
                    'Topological sorting of A, B and C should yield [C, B, A]',
                    () => expect(Array.from(TopologicalSort(adjacencyList))).toEqual([3, 2, 1]));
            });
    });
