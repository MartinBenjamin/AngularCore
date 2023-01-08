export class SortedList<T>
{
    protected _array  : T[] = [];
    protected _compare: (lhs: T, rhs: T) => number =
        (lhs, rhs) => lhs === rhs ? 0 : lhs < rhs ? -1 : 1;

    constructor(
        compare: (lhs: T, rhs: T) => number,
        values?: Iterable<T>,
        )
    {
        if(compare)
            this._compare = compare;

        if(values)
            for(const value of values)
                this.add(value);
    }

    get Array(): ReadonlyArray<T>
    {
        return this._array;
    }

    public add(
        value: T
        ): this
    {
        this._array.splice(
            this.lastBefore(value) + 1,
            0,
            value);

        return this;
    }

    first(
        t: T
        ): number
    {
        if(!this._array.length)
            return -1;

        let start = 0;
        let end = this._array.length - 1;

        while(start !== end)
        {
            const mid = Math.floor((start + end) / 2);

            if(this._compare(this._array[mid], t) < 0)
                // mid value < t.
                start = mid + 1;

            else
                // mid value >= t.
                end = mid;
        }

        return this._compare(
            this._array[start],
            t) === 0 ? start : -1;
    }

    lastBefore(
        t: T
        ): number
    {
        if(!this._array.length)
            return -1;

        let start = 0;
        let end = this._array.length - 1;

        while(start !== end)
        {
            const mid = Math.ceil((start + end) / 2);

            if(this._compare(this._array[mid], t) < 0)
                // mid value < t.
                start = mid;

            else
                // mid value >= t;
                end = mid - 1;
        }

        return this._compare(
            this._array[start],
            t) < 0 ? start : -1;
    }

    last(
        t: T
        ): number
    {
        if(!this._array.length)
            return -1;

        let start = 0;
        let end = this._array.length - 1;

        while(start !== end)
        {
            const mid = Math.ceil((start + end) / 2);

            if(this._compare(this._array[mid], t) <= 0)
                // mid value <= t.
                start = mid;

            else
                // mid value > t.
                end = mid - 1;
        }

        return this._compare(
            this._array[start],
            t) === 0 ? start : -1;
    }

    firstAfter(
        t: T
        ): number
    {
        if(!this._array.length)
            return -1;

        let start = 0;
        let end = this._array.length - 1;

        while(start !== end)
        {
            const mid = Math.floor((start + end) / 2);

            if(this._compare(this._array[mid], t) <= 0)
                // mid value <= t.
                start = mid + 1;

            else
                // mid value > t.
                end = mid;
        }

        return this._compare(
            this._array[start],
            t) > 0 ? start : -1;
    }
}

export class SortedSet<T> extends SortedList<T> implements Set<T>
{
    constructor(
        compare: (lhs: T, rhs: T) => number,
        values?: Iterable<T>
        )
    {
        super(
            compare,
            values)
    }

    add(
        value: T
        ): this
    {
        const index = this.lastBefore(value) + 1;
        if(index === this._array.length || this._compare(this._array[index], value) !== 0)
            this._array.splice(
                index,
                0,
                value);

        return this;
    }

    clear(): void
    {
        this._array = [];
    }

    delete(
        value: T
        ): boolean
    {
        const index = this.first(value);
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
        return this.first(value) !== -1;
    }

    get size(): number
    {
        return this._array.length;
    }

    [Symbol.iterator](): IterableIterator<T>
    {
        return this.values();
    }

    *entries(): IterableIterator<[T, T]>
    {
        for(const [, value] of this._array.entries())
            yield [value, value];
    }

    keys(): IterableIterator<T>
    {
        return this.values();
    }

    *values(): IterableIterator<T>
    {
        yield* this._array;
    }

    [Symbol.toStringTag]: string;
}
