import { Compare } from "./SortedSet";

export function MergeSort<T>(
    compare: Compare<T>,
    array: T[],
    left: number = 0,
    right: number = array.length - 1
    )
{
    if(left >= right)
        return;

    const mid = Math.floor(left + (right - left) / 2);
    MergeSort(compare, array, left, mid);
    MergeSort(compare, array, mid + 1, right);

    const l = array.slice(left, mid + 1);
    const r = array.slice(mid + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;
    while(i < l.length && j < r.length)
        if(compare(l[i], r[j]) <= 0)
            array[k++] = l[i++];
        else
            array[k++] = r[j++];

    while(i < l.length)
        array[k++] = l[i++];

    while(j < r.length)
        array[k++] = r[j++];
}
