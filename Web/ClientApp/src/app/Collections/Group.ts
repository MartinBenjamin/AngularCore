export function Group<T, TKey, TValue>(
    iterable     : Iterable<T>,
    keyAccessor  : (t: T) => TKey,
    valueAccessor: (t: T) => TValue
    ): ReadonlyMap<TKey, TValue[]>
{
    let map = new Map<TKey, TValue[]>();
    for(let t of iterable)
    {
        let key    = keyAccessor(t);
        let value  = valueAccessor(t);
        let values = map.get(key);
        if(values)
            values.push(value);

        else
            map.set(
                key,
                [value])
    }
    return map;
}

export function GroupJoin<TLeft, TRight, TKey>(
    leftIterable    : Iterable<TLeft>,
    rightIterable   : Iterable<TRight>,
    leftKeySelector : (left: TLeft) => TKey,
    rightKeySelector: (right: TRight) => TKey
    ): ReadonlyMap<TLeft, TRight[]>
{
    const map = Group(
        rightIterable,
        rightKeySelector,
        (t: TRight) => t);

    const join = new Map<TLeft, TRight[]>();
    const empty: TRight[] = [];
    for(const left of leftIterable)
    {
        const rights = map.get(leftKeySelector(left));
        join.set(
            left,
            rights ? rights : empty);
    }

    return join;
}
