import { } from 'jasmine';
import { assertBuilder } from '../assertBuilder';
import { SortedSet } from './SortedSet';

describe(
    'SortedSet',
    () =>
    {
        describe(
            "Given values: number[] = [1, 1, 3, 3, 3, 5, 5, 5, 5].reverse() and set = new SortedSet(null, values):",
            () =>
            {
                const values: number[] = [1, 1, 3, 3, 3, 5, 5, 5, 5].reverse();
                const set = new SortedSet(
                    null,
                    values);

                const assert = assertBuilder('set')(set);
                assert('set.size === 3');

                for(let value = 0; value <= 6; ++value)
                    assert(`set.has(${value}) === ${values.indexOf(value) !== -1}`);

                assert('[...set].length === 3');
                assert('[...set][0] === 1');
                assert('[...set][1] === 3');
                assert('[...set][2] === 5');

                for(const value of [0, 2, 4, 6])
                {
                    assert(`set.add(${value}) === set`);
                    assert(`set.size === 4`);
                    assert(`set.has(${value})`);
                    assert(`set.add(${value}) === set`);
                    assert(`set.size === 4`);
                    assert(`set.delete(${value})`);
                    assert(`set.size === 3`);
                    assert(`!set.has(${value})`);
                    assert(`!set.delete(${value})`);
                }

                it(
                    'Expect [...set.values()] to be [1, 3, 5]',
                    () => expect(JSON.stringify([...set.values()])).toBe(JSON.stringify([1, 3, 5])));

                it(
                    'Expect [...set.keys()] to be [1, 3, 5]',
                    () => expect(JSON.stringify([...set.keys()])).toBe(JSON.stringify([1, 3, 5])));

                it(
                    'Expect [...set.entries()] to be [[1, 1], [3, 3], [5, 5]]',
                    () => expect(JSON.stringify([...set.entries()])).toBe(JSON.stringify([[1, 1], [3, 3], [5, 5]])));

                it(
                    'Expect [...set] to be [1, 3, 5]',
                    () => expect(JSON.stringify([...set])).toBe(JSON.stringify([1, 3, 5])));
            });
    });
