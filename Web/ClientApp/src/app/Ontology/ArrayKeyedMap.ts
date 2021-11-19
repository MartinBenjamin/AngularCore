export interface TrieNode<TTrieNode extends TrieNode<TTrieNode, V>, V>
{
    value   : V,
    children: Map<any[], TrieNode<TTrieNode, V>>
}

export class ArrayKeyedMap<K extends any[], V> implements Map<K, V>, TrieNode<ArrayKeyedMap<K, V>, V>
{
    private _value    : V;
    private _children = new Map<any, ArrayKeyedMap<any[], V>>();

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
        this._children.clear();
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
                return true;
            }

            return false;
        }

        const [first, ...rest] = key;
        const child = this._children.get(first);

        if(child)
        {
            const deleted = child.delete(rest);
            if(deleted && !child.size)
                this._children.delete(first);

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
        const child = this._children.get(first);
        return child ? child.get(rest) : undefined;
    }

    has(
        key: K
        ): boolean
    {
        if(key.length === 0)
            return this._value !== undefined;

        const [first, ...rest] = key;
        const child = this._children.get(first);
        return child ? child.has(rest) : false;
    }

    set(
        key  : K,
        value: V
        ): this
    {
        if(key.length === 0)
        {
            this._value = value;
            return this;
        }

        const [first, ...rest] = key;
        let child = this._children.get(first);
        if(!child)
        {
            child = new ArrayKeyedMap();
            this._children.set(
                first,
                child);
        }

        child.set(
            rest,
            value);
    }

    get size(): number
    {
        let size = this._value === undefined ? 0 : 1;
        this._children.forEach(child => size += child.size);
        return size;
    }

    [Symbol.iterator](): IterableIterator<[K, V]>
    {
        return this.entries();
    }

    *entries(): IterableIterator<[K, V]>
    {
        if(this._value !== undefined)
            yield [<K>[], this._value];

        for(const [key, child] of this._children.entries())
            for(const [childKey, value] of child.entries())
                yield [<K>[key, ...childKey], value];
    }

    *keys(): IterableIterator<K>
    {
        if(this._value !== undefined)
            yield <K>[];

        for(const [key, child] of this._children.entries())
            for(const childKey of child.keys())
                yield <K>[key, ...childKey];
    }

    *values(): IterableIterator<V>
    {
        if(this._value !== undefined)
            yield this._value;

        for(const child of this._children.values())
            yield* child.values();
    }

    [Symbol.toStringTag]: string;

    get value(): V
    {
        return this._value;
    }

    get children(): Map<any, ArrayKeyedMap<any[], V>>
    {
        return this._children;
    }
}
