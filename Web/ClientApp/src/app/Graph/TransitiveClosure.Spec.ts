import { } from 'jasmine';
import { TransitiveClosure } from './TransitiveClosure';

describe(
    'TransitiveClosure',
    () =>
    {
        it(
            'The transitive closure of [] is [].',
            () =>
            {
                const input = [];
                const expected = [];
                const result = TransitiveClosure(input);
                for(let row = 0; row < input.length; ++row)
                    for(let column = 0; column < input[row].length; ++column)
                        expect(result[row][column]).toBe(expected[row][column]);
            });

        it(
            'The transitive closure of [[false]] is [[false]].',
            () =>
            {
                const input = [[false]];
                const expected = [[false]];
                const result = TransitiveClosure(input);
                for(let row = 0; row < input.length; ++row)
                    for(let column = 0; column < input[row].length; ++column)
                        expect(result[row][column]).toBe(expected[row][column]);
            });

        it(
            'The transitive closure of [[true]] is [[true]].',
            () =>
            {
                const input = [[true]];
                const expected = [[true]];
                const result = TransitiveClosure(input);
                for(let row = 0; row < input.length; ++row)
                    for(let column = 0; column < input[row].length; ++column)
                        expect(result[row][column]).toBe(expected[row][column]);
            });

        it(
            'The transitive closure of [[false, true, false], [false, false, true], [false, false, false]] is [[false, true, true], [false, true, true], [false, false, false]].',
            () =>
            {
                const input = [[false, true, false], [false, false, true], [false, false, false]];
                const expected = [[false, true, true], [false, false, true], [false, false, false]];
                const result = TransitiveClosure(input);
                for(let row = 0; row < input.length; ++row)
                    for(let column = 0; column < input[row].length; ++column)
                        expect(result[row][column]).toBe(expected[row][column]);
            });

        it(
            'The transitive closure of [[false, false, true], [false, false, false], [false, true, false]] is [[true, true, true], [false, false, false], [true, false, false]].',
            () =>
            {
                const input = [[false, false, true], [false, false, false], [false, true, false]];
                const expected = [[false, true, true], [false, false, false], [false, true, false]];
                const result = TransitiveClosure(input);
                for(let row = 0; row < input.length; ++row)
                    for(let column = 0; column < input[row].length; ++column)
                        expect(result[row][column]).toBe(expected[row][column]);
            });

    });
