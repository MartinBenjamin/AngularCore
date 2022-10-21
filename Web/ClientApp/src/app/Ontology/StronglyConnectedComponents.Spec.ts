import { } from 'jasmine';
import { Condense, StronglyConnectedComponents } from './StronglyConnectedComponents';

const testGraph = new Map(
    [
        [1, [2   ]],
        [2, [3, 8]],
        [3, [4, 7]],
        [4, [5   ]],
        [5, [3, 6]],
        [6, [    ]],
        [7, [4, 6]],
        [8, [1, 7]]
    ]
);

const expectedStronglyConnectedComponents = [
    [6],
    [1, 2, 8],
    [3, 4, 5, 7]
];

const expectedStronglyConnectedComponentGraph = [

    [[6], []],
    [[1, 2, 8], [[3, 4, 5, 7]]],
    [[3, 4, 5, 7], [[6]]]
];

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

describe(
    'StronglyConnectedComponents',
    () =>
    {

        let stronglyConnectedComponents = StronglyConnectedComponents(testGraph);
        stronglyConnectedComponents = stronglyConnectedComponents.map(component => component.sort((a, b) => a - b));
        stronglyConnectedComponents = stronglyConnectedComponents.sort(Compare);

        it(
            `The strongly connected components of ${JSON.stringify([...testGraph])} are ${JSON.stringify(stronglyConnectedComponents)}`,
            () => expect(JSON.stringify(stronglyConnectedComponents)).toBe(JSON.stringify(expectedStronglyConnectedComponents)));

        let condensed = Condense(testGraph);
        for(const vertex of condensed.keys())
            vertex.sort((a, b) => a - b);

        for(const adjacent of condensed.values())
            adjacent.sort(Compare);

        it(
            `The condenced graph of ${JSON.stringify([...testGraph])} is ${JSON.stringify(expectedStronglyConnectedComponentGraph)}`,
            () => expect(JSON.stringify([...condensed].sort(([a,], [b,]) => Compare(a, b)))).toBe(JSON.stringify(expectedStronglyConnectedComponentGraph)));
    });
