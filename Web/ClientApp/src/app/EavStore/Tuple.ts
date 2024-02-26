import { Compare, DefaultCompare } from "../Collections/SortedSet";

export type Tuple  = readonly any[];
export type Double = readonly [any, any];

export function TupleCompareFactory<T extends Tuple>(
    elementCompare: Compare = DefaultCompare
    ): Compare<T>
{
    return function(
        a: T,
        b: T
        ): number
    {
        let result = a.length - b.length;
        for(let index = 0; index < a.length && result === 0; ++index)
            result = elementCompare(
                a[index],
                b[index]);

        return result;
    }
}
