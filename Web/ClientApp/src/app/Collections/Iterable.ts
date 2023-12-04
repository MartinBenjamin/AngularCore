export function* Filter<T>(
    iterable: Iterable<T>,
    callbackFn: (t: T) => boolean
    ): IterableIterator<T>
{
    for(const t of iterable)
        if(callbackFn(t))
            yield t;
}

export function* Map<T, U>(
    iterable: Iterable<T>,
    callbackFn: (t: T) => U
    ): IterableIterator<U>
{
    for(const t of iterable)
        yield callbackFn(t);
}
