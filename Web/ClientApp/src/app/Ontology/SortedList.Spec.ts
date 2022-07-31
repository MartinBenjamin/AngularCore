import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { ArraySet } from './ArraySet';
import { SortedList } from './SortedSet';

describe(
    'SortedList',
    () =>
    {
        describe(
            "Given values: number[] = [1, 1, 3, 3, 3, 5, 5, 5, 5] and list = new SortedList(null, values):",
            () =>
            {
                const values: number[] = [1, 1, 3, 3, 3, 5, 5, 5, 5];
                const list = new SortedList(
                    null,
                    values);

                let assert = assertBuilder('list')(list);
                for(let value = 0; value <= 6; ++value)
                    assert(`list.first(${value}) === ${values.indexOf(value)}`);

                for(let value = 0; value <= 6; ++value)
                    assert(`list.last(${value}) === ${values.lastIndexOf(value)}`);

                assert('list.lastBefore(0) === -1');
                assert('list.lastBefore(1) === -1');
                assert('list.lastBefore(2) ===  1');
                assert('list.lastBefore(3) ===  1');
                assert('list.lastBefore(4) ===  4');
                assert('list.lastBefore(5) ===  4');
                assert('list.lastBefore(6) ===  8');

                list.first(3);
                //assert('values.every(value => set.has(value))');
                //assert('set.has([])');
                //assert('set.has([0])');
                //assert('set.has([0, 1])');
                //assert('set.has([0, 2])');
                //assert('!set.has([0, 3])');

                //assert('[...set.values()].length === 4');
                //assert('[...set.values()].every(value0 => values.some(value1 => value0.length === value1.length && value0.every((element, index) => element === value1[index])))');
                //assert('[...set.keys()].length === 4');
                //assert('[...set.keys()].every(key => values.some(value => key.length === value.length && key.every((element, index) => element === value[index])))');
            });
    });
