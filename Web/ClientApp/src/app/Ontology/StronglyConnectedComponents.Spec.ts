import { } from 'jasmine';
import { StronglyConnectedComponents } from './StronglyConnectedComponents';

const testGraph = new Map<number, Iterable<number>>(
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


describe(
    'StronglyConnectedComponents',
    () =>
    {

        const stronglyConnectedComponents = StronglyConnectedComponents(testGraph);

        it(
            JSON.stringify(stronglyConnectedComponents),
            () => true);

    });
