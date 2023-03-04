import { } from 'jasmine';
import { ArraySet } from './ArraySet';
import { assertBuilder } from './assertBuilder';

function compareTuple(
    lhs: any[],
    rhs: any[]
    ): number
{
    const difference = lhs.length - rhs.length;
    if(difference !== 0)
        return difference;

    for(let index = 0; index < lhs.length; ++index)
        if(lhs[index] !== rhs[index])
            return lhs[index] < rhs[index] ? -1 : 1;

    return 0;
}

describe(
    'ArraySet',
    () =>
    {
        describe(
            "Given values: any[][] = [[], [], [0], [0, 1], [0, 2], [0, 2]] and set = new ArraySet(values):",
            () =>
            {
                const values: any[][] = [[], [0], [0, 1], [0, 2]];
                const set = new ArraySet(values);
                //const set = new SortedSet(compareTuple, values)
                let assert = assertBuilder('values', 'set')(values, set);
                assert('set.size === 4');
                assert('values.every(value => set.has(value))');
                assert('set.has([])');
                assert('set.has([0])');
                assert('set.has([0, 1])');
                assert('set.has([0, 2])');
                assert('!set.has([0, 3])');

                assert('[...set.values()].length === 4');
                assert('[...set.values()].every(value0 => values.some(value1 => value0.length === value1.length && value0.every((element, index) => element === value1[index])))');
                assert('[...set.keys()].length === 4');
                assert('[...set.keys()].every(key => values.some(value => key.length === value.length && key.every((element, index) => element === value[index])))');
            });

        describe(
            "Given set = new ArraySet() and set.set([0, 1]):",
            () =>
            {
                const set = new ArraySet();
                set.add([0, 1]);
                let assert = assertBuilder('set')(set);
                assert('set.size === 1');
                assert('set.has([0, 1])');
            });

        describe(
            "Given set = new ArraySet([[0, 1]]) and set.delete([0, 1]):",
            () =>
            {
                const set = new ArraySet([[0, 1]]);
                set.delete([0, 1]);
                let assert = assertBuilder('set')(set);
                assert('set.size === 0');
                assert('!set.has([0, 1])');
            });
    });
