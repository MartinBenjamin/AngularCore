import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
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

                assert('list.lastBefore(0) === -1');
                assert('list.lastBefore(1) === -1');
                assert('list.lastBefore(2) ===  1');
                assert('list.lastBefore(3) ===  1');
                assert('list.lastBefore(4) ===  4');
                assert('list.lastBefore(5) ===  4');
                assert('list.lastBefore(6) ===  8');

                for(let value = 0; value <= 6; ++value)
                    assert(`list.last(${value}) === ${values.lastIndexOf(value)}`);

                assert('list.firstAfter(0) ===  0');
                assert('list.firstAfter(1) ===  2');
                assert('list.firstAfter(2) ===  2');
                assert('list.firstAfter(3) ===  5');
                assert('list.firstAfter(4) ===  5');
                assert('list.firstAfter(5) === -1');
                assert('list.firstAfter(6) === -1');
            });
    });
