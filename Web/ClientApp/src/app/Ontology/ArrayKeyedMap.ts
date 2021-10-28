const ValueKey = Symbol("ValueKey")

export class ArrayKeyedMap<K extends any[], V> implements Map<K, V>
{
    private _map  = new Map();
    private _size = 0;

    constructor(
        entries?: Iterable<[K, V]>
        )
    {
        if(entries)
            for(const [key, value] of entries)
                this.set(
                    key,
                    value);
    }

    clear(): void
    {
        this._map.clear();
    }

    delete(
        key: K
        ): boolean
    {
        if(key.length === 0)
        {
            const deleted = this._map.delete(ValueKey);
            if(deleted)
                this._size -= 1;
            return deleted;
        }

        const [first, ...rest] = key;
        const next: Map<any[], V> = this._map.get(first);

        if(next)
        {
            const deleted = next.delete(rest);
            if(deleted)
            {
                if(!next.size)
                    this._map.delete(first);

                this._size -= 1;
            }
            return deleted;
        }
        return false;
    }

    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?  : any
        ): void
    {
        for(const [key, value] of this.entries())
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
        if(key.length === 0)
            return this._map.get(ValueKey);

        const [first, ...rest] = key;
        const next: Map<any[], V> = this._map.get(first);
        return next ? next.get(rest) : undefined;
    }

    has(
        key: K
        ): boolean
    {
        if(key.length === 0)
            return this._map.has(ValueKey);

        const [first, ...rest] = key;
        const next: Map<any[], V> = this._map.get(first);
        return next ? next.has(rest) : false;
    }

    set(
        key  : K,
        value: V
        ): this
    {
        if(key.length === 0)
        {
            if(!this._map.has(ValueKey))
                this._size += 1;

            this._map.set(
                ValueKey,
                value);

            return this;
        }

        const [first, ...rest] = key;
        let next: Map<any[], V> = this._map.get(first);
        if(!next)
        {
            next = new ArrayKeyedMap();
            this._map.set(
                first,
                next);
        }
        const beforeSize = next.size;
        next.set(
            rest,
            value);
        this._size += next.size - beforeSize;
    }

    get size(): number
    {
        return this._size;
    }

    [Symbol.iterator](): IterableIterator<[K, V]>
    {
        return this.entries();
    }

    *entries(): IterableIterator<[K, V]>
    {
        for(const [key, value] of this._map.entries())
            if(key === ValueKey)
                yield [<K>[], value];

            else for(const entry of value.entries())
                yield [<K>[key, ...entry[0]], entry[1]];
    }

    *keys(): IterableIterator<K>
    {
        for(const [key, value] of this._map.entries())
            if(key === ValueKey)
                yield <K>[];

            else for(const childKey of value.keys())
                yield <K>[key, ...childKey];
    }

    *values(): IterableIterator<V>
    {
        for(const [key, value] of this._map.entries())
            if(key === ValueKey)
                yield value;

            else yield* value.values();
    }

    [Symbol.toStringTag]: string;
}
