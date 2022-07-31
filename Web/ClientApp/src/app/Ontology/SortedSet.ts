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

        return this.findFirst(
            t,
            0,
            this._array.length - 1);
    }

    lastBefore(
        t: T
        ): number
    {
        if(!this._array.length)
            return -1;

        return this.findLastBefore(
            t,
            0,
            this._array.length - 1);
    }

    last(
        t: T
        ): number
    {
        if(!this._array.length)
            return -1;

        return this.findLast(
            t,
            0,
            this._array.length - 1);
    }

    firstAfter(
        t: T
        ): number
    {
        if(!this._array.length)
            return -1;

        return this.findFirstAfter(
            t,
            0,
            this._array.length - 1);
    }

    private findFirst(
        t    : T,          
        start: number,
        end  : number           
        ): number
    {
        if(start === end)
            return this._compare(
                this._array[start],
                t) === 0 ? start : -1;

        const mid = Math.floor((start + end) / 2);

        if(this._compare(this._array[mid], t) < 0)
            // mid value < t.
            return this.findFirst(
                t,
                mid + 1,
                end);

        else
            // mid value >= t.
            return this.findFirst(
                t,
                start,
                mid);
    }

    private findLastBefore(
        t    : T,
        start: number,
        end  : number
        ): number
    {
        if(start === end)
            return this._compare(
                this._array[start],
                t) < 0 ? start : -1;

        const mid = Math.ceil((start + end) / 2);

        if(this._compare(this._array[mid], t) < 0)
            // mid value < t.
            return this.findLastBefore(
                t,
                mid,
                end);

        else
            // mid value >= t;
            return this.findLastBefore(
                t,
                start,
                mid - 1);
    }

    private findLast(
        t    : T,          
        start: number,
        end  : number           
        ): number
    {
        if(start == end)
            return this._compare(
                this._array[start],
                t) === 0 ? start : -1;

        const mid = Math.ceil((start + end) / 2);

        if(this._compare(this._array[mid], t) <= 0)
            // mid value <= t.
            return this.findLast(
                t,
                mid,
                end);

        else
            // mid value > t.
            return this.findLast(
                t,
                start,
                mid - 1);
    }

    private findFirstAfter(
        t    : T,          
        start: number,
        end  : number           
        ): number
    {
        if(start == end)
            return this._compare(
                this._array[start],
                t) > 0 ? start : -1;

        const mid = Math.floor((start + end) / 2);

        if(this._compare(this._array[mid], t) <= 0)
            // mid value <= t.
            return this.findFirstAfter(
                t,
                mid + 1,
                end);

        else
            // mid value > t.
            return this.findFirstAfter(
                t,
                start,
                mid);
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
        for(const value of this._array)
            yield value;
    }

    [Symbol.toStringTag]: string;
}
