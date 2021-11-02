export class ArrayKeyedMap<K extends any[], V> implements Map<K, V>
{
    private _value: V;
    private _map  = new Map<any, ArrayKeyedMap<any[], V>>();
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
        this._value = undefined;
        this._map.clear();
        this._size = 0;
    }

    delete(
        key: K
        ): boolean
    {
        if(key.length === 0)
        {
            if(this._value !== undefined)
            {
                this._value = undefined;
                this._size -= 1;
                return true;
            }

            return false;
        }

        const [first, ...rest] = key;
        const next = this._map.get(first);

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
            return this._value;

        const [first, ...rest] = key;
        const next = this._map.get(first);
        return next ? next.get(rest) : undefined;
    }

    has(
        key: K
        ): boolean
    {
        if(key.length === 0)
            return this._value !== undefined;

        const [first, ...rest] = key;
        const next = this._map.get(first);
        return next ? next.has(rest) : false;
    }

    set(
        key  : K,
        value: V
        ): this
    {
        if(key.length === 0)
        {
            if(this._value === undefined)
                this._size += 1;

            this._value = value;
            return this;
        }

        const [first, ...rest] = key;
        let next = this._map.get(first);
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
        if(this._value !== undefined)
            yield [<K>[], this._value];

        for(const [key, next] of this._map.entries())
            for(const [childKey, value] of next.entries())
                yield [<K>[key, ...childKey], value];
    }

    *keys(): IterableIterator<K>
    {
        if(this._value !== undefined)
            yield <K>[];

        for(const [key, next] of this._map.entries())
            for(const childKey of next.keys())
                yield <K>[key, ...childKey];
    }

    *values(): IterableIterator<V>
    {
        if(this._value !== undefined)
            yield this._value;

        for(const next of this._map.values())
            yield* next.values();
    }

    [Symbol.toStringTag]: string;
}
