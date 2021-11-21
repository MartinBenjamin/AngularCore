import { ArrayKeyedMap } from './ArrayKeyedMap';

export class ArraySet implements Set<any[]>
{
    private _map = new ArrayKeyedMap<any[], any[]>();

    constructor(
        values?: Iterable<T>
        )
    {
        if(values)
            for(const value of values)
                this.add(value);
    }

    add(
        value: any[]
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
        value: any[]
        ): boolean
    {
        return this._map.delete(value);
    }

    forEach(
        callbackfn: (value: any[], key: any[], set: Set<any[]>) => void,
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
        value: any[]
        ): boolean
    {
        return this._map.has(value);
    }

    get size(): number
    {
        return this._map.size;
    }

    [Symbol.iterator](): IterableIterator<any[]>
    {
        return this.values();
    }

    *entries(): IterableIterator<[any[], any[]]>
    {
        for(const value of this.values())
            yield [value, value];
    }

    keys(): IterableIterator<any[]>
    {
        return this.values();
    }

    values(): IterableIterator<any[]>
    {
        return this._map.values();
    }

    [Symbol.toStringTag]: string;
}
