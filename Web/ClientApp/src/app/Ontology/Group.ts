export function Group<T, TKey, TValue>(
    iterable     : Iterable<T>,
    keyAccessor  : (t: T) => TKey,
    valueAccessor: (t: T) => TValue
    ): Map<TKey, TValue[]>
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
