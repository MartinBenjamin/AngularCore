import { SortedList, Compare } from "./SortedSet";

export class SortedMap<K, V> extends SortedList<[K, V]> implements Map<K, V>
{
    constructor(
        private _keyCompare: Compare<K>,
        entries?           : Iterable<[K, V]>
        )
    {
        super(
            (a: [K, V], b: [K, V]) => _keyCompare(a[0], b[0]),
            [])

        if(entries)
            for(const [key, value] of entries)
                this.set(
                    key,
                    value);
    }

    clear(): void
    {
        this._array = [];
    }

    delete(
        key: K
        ): boolean
    {
        const index = this.first([key, undefined]);
        if(index !== -1)
        {
            this._array.splice(
                index,
                1);

            return true;
        }

        return false;
    }

    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?  : any
        ): void
    {
        for(const [key, value] of this._array)
            thisArg ?
                callbackfn.call(
                    thisArg,
                    value,
                    key,
                    this) :
                callbackfn(
                    value,
                    key,
                    this);
    }

    get(
        key: K
        ): V
    {
        const index = this.first([key, undefined]);
        return index !== -1 ? this._array[index][1] : undefined;
    }

    has(
        key: K
        ): boolean
    {
        return this.first([key, undefined]) !== -1;
    }

    set(
        key  : K,
        value: V
        ): this
    {
        const element: [K, V] = [key, value];
        const index = this.lastBefore(element) + 1;
        if(index === this._array.length || this._keyCompare(this._array[index][0], key) !== 0)
            this._array.splice(
                index,
                0,
                element);

        else
            this._array[index][1] = value;

        return this;
    }

    get size(): number
    {
        return this._array.length;
    }

    [Symbol.iterator](): IterableIterator<[K, V]>
    {
        return this._array.values();
    }

    entries(): IterableIterator<[K, V]>
    {
        return this._array.values();
    }

    *keys(): IterableIterator<K>
    {
        for(const [key, ] of this._array)
            yield key;
    }

    *values(): IterableIterator<V>
    {
        for(const [, value] of this._array)
            yield value;
    }

    [Symbol.toStringTag]: string;

    shift(): [K, V]
    {
        return this._array.shift();
    }

    pop(): [K, V]
    {
        return this._array.pop();
    }
}
