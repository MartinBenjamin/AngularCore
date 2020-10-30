import { } from 'jasmine';
import { LongestPaths, TopologicalSort } from './AdjacencyList';

describe(
    'Adjacency List',
    () =>
    {
        describe(
            'Given A is adjacent to B, A is adjacent to C and B is adjacent to D:',
            () =>
            {
                let A = 1;
                let B = 2;
                let C = 3;
                let D = 4;
                let adjacencyList = new Map<number, number[]>();
                adjacencyList.set(A, [B, C]);
                adjacencyList.set(B, [D]);
                adjacencyList.set(C, []);
                adjacencyList.set(D, []);

                let longestPaths = LongestPaths(adjacencyList);
                it(
                    'The longest path of A is 2',
                    () => expect(longestPaths.get(A)).toBe(2));
                it(
                    'The longest path of B is 1',
                    () => expect(longestPaths.get(B)).toBe(1));
                it(
                    'The longest path of C is 0',
                    () => expect(longestPaths.get(C)).toBe(0));
                it(
                    'The longest path of D is 0',
                    () => expect(longestPaths.get(D)).toBe(0));
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
