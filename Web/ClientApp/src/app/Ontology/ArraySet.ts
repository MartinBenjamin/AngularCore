const ValueKey = Symbol("ValueKey")

export class ArraySet<T extends any[]> implements Set<T>
{
    private _map  = new Map();
    private _size = 0;

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
        if(value.length === 0)
        {
            if(!this._map.has(ValueKey))
                this._size += 1;

            this._map.set(
                ValueKey,
                null);

            return this;
        }

        const [first, ...rest] = value;
        let next: Set<any[]> = this._map.get(first);
        if(!next)
        {
            next = new ArraySet();
            this._map.set(
                first,
                next);
        }
        const beforeSize = next.size;
        next.add(rest);
        this._size += next.size - beforeSize;
    }

    clear(): void
    {
        this._map.clear();
    }

    delete(
        value: T
        ): boolean
    {
        if(value.length === 0)
        {
            const deleted = this._map.delete(ValueKey);
            if(deleted)
                this._size -= 1;
            return deleted;
        }

        const [first, ...rest] = value;
        const next: Set<any[]> = this._map.get(first);

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
        callbackfn: (value: T, key: T, set: Set<T>) => void,
        thisArg?  : any
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
        if(value.length === 0)
            return this._map.has(ValueKey);

        const [first, ...rest] = value;
        const next: Set<any[]> = this._map.get(first);
        return next ? next.has(rest) : false;
    }

    get size(): number
    {
        return this._size;
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

    *values(): IterableIterator<T>
    {
        for(const [key, value] of this._map.entries())
            if(key === ValueKey)
                yield <T>[];

            else for(const childValue of value.values())
                yield <T>[key, ...childValue];
    }

    [Symbol.toStringTag]: string;
}
