import { } from 'jasmine';
import { LongestPaths, TopologicalSort, Transpose } from './AdjacencyList';

function Compare(
    lhs: number[],
    rhs: number[]
    ): number
{
    let result = lhs.length - rhs.length;
    if(result !== 0)
        return result;

    for(let index = 0; index < lhs.length && result === 0; ++index)
        result = lhs[index] - rhs[index];

    return result;
}

function Order<TVertex>(
    graph: Iterable<[TVertex, TVertex[]]>,
    vertexComparer: (lhs: TVertex, rhs: TVertex) => number
    ): [TVertex, TVertex[]][]
{
    return [...graph]
        .sort(([lhs,], [rhs,]) => vertexComparer(lhs, rhs))
        .map(([vertex, adjacent]) => [vertex, adjacent.sort(vertexComparer)]);
}

describe(
    'Adjacency List',
    () =>
    {
        describe(
            'LongestPaths',
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
                        let adjacencyList = new Map<number, number[]>([
                            [A, [B, C]],
                            [B, [D   ]],
                            [C, [    ]],
                            [D, [    ]]]);

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
            });


        describe(
            'TopologicalSort',
            () =>
            {
                describe(
                    'Given A is adjacent to B and B is adjacent to C:',
                    () =>
                    {
                        let adjacencyList = new Map<number, number[]>([
                            [1, [2]],
                            [2, [3]],
                            [3, [ ]]]);

                        it(
                            'Topological sorting of A, B and C should yield [C, B, A]',
                            () => expect(TopologicalSort(adjacencyList)).toEqual([3, 2, 1]));
                    });
            });

        describe(
            `Transpose`,
            () =>
            {
                const testGraph = new Map([
                    [1, [2, 3]],
                    [2, [4   ]],
                    [3, [    ]],
                    [4, [    ]]]);

                const expectedTranspose = [
                    [1, [ ]],
                    [2, [1]],
                    [3, [1]],
                    [4, [2]]];

                const transpose = [...Transpose(testGraph)].sort(([a,], [b,]) => a - b);
                transpose.forEach(([, adjacent]) => adjacent.sort((a, b) => a - b));

                it(
                    `The transpose of ${JSON.stringify([...testGraph])} is ${JSON.stringify(transpose)}`,
                    () => expect(JSON.stringify(transpose)).toBe(JSON.stringify(expectedTranspose)));

            });
    });
