import { ArrayKeyedMap } from './ArrayKeyedMap';

export class ArraySet<T extends any[]> implements Set<T>
{
    private _map = new ArrayKeyedMap<T, T>();

    constructor(
        values?: Iterable<T>
        )
    {
        if(values)
            for(const value of values)
                this.add(value);
    }

    add(
        value: T
        ): this
    {
        this._map.set(
            value,
            value);
        return this;
    }

    clear(): void
    {
        this._map.clear();
    }

    delete(
        value: T
        ): boolean
    {
        return this._map.delete(value);
    }

    forEach(
        callbackfn: (value: T, value2: T, set: Set<T>) => void,
        thisArg?: any
        ): void
    {
        for(const value of this.values())
            thisArg ?
                callbackfn.call(
                    thisArg,
                    value,
                    value,
                    this) :
                callbackfn(
                    value,
                    value,
                    this);
    }

    has(
        value: T
        ): boolean
    {
        return this._map.has(value);
    }

    get size(): number
    {
        return this._map.size;
    }

    [Symbol.iterator](): IterableIterator<T>
    {
        return this.values();
    }

    *entries(): IterableIterator<[T, T]>
    {
        for(const value of this.values())
            yield [value, value];
    }

    keys(): IterableIterator<T>
    {
        return this.values();
    }

    values(): IterableIterator<T>
    {
        return this._map.values();
    }

    [Symbol.toStringTag]: string;
}
