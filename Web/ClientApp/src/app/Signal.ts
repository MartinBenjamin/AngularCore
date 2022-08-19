import { SortedList } from "./Ontology/SortedSet";
import { Observable, Subscriber } from "rxjs";

export interface IVertex
{
    readonly In         : ReadonlyArray<IVertex>;
    readonly Out        : ReadonlyArray<IVertex>;
    readonly LongestPath: number;
}

export interface ISchedulable extends IVertex
{
    Run(scheduler: IScheduler): void;
}

export interface IScheduler
{
    Schedule(schedulable: ISchedulable): void;
    Suspend(): void;
    Unsuspend(): void;
    Update(update: (scheduler: IScheduler) => void);
}

export interface ISignal<T> extends IVertex
{
    readonly Out  : ReadonlyArray<ISchedulable>;
    readonly Value: T;

    Subscribe(schedulable: ISchedulable): void;
    Unsubscribe(schedulable: ISchedulable): void;

    Update(
        value    : T,
        scheduler: IScheduler): void

    Observe(): Observable<T>;

    Map<R>(map: (t: T) => R): ISignal<R>;

    Dispose(): void;
}

export class Signal<T> implements ISignal<T>
{
    private _value           : T;
    private _out             : ISchedulable[] = [];
    private _eventSubscribers: Set<Subscriber<T>>;

    private static _in: IVertex[] = [];

    constructor(
        value: T
        )
    {
        this._value = value;
    }

    get In(): ReadonlyArray<IVertex>
    {
        return Signal._in;
    }

    get Out(): ReadonlyArray<ISchedulable>
    {
        return this._out;
    }

    get LongestPath(): number
    {
        return 0;
    }

    get Value(): T
    {
        return this._value;
    }

    Subscribe(
        schedulable: ISchedulable
        ): void
    {
        this._out.push(schedulable);
    }

    Unsubscribe(
        schedulable: ISchedulable
        ): void
    {
        this._out.splice(
            this._out.indexOf(schedulable),
            1);
    }

    Update(
        value    : T,
        scheduler: IScheduler
        ): void
    {
        this._value = value;
        for(const schedulable of this._out)
            scheduler.Schedule(schedulable);

        if(this._eventSubscribers)
            this._eventSubscribers.forEach(subscriber => subscriber.next(this._value));
    }

    Observe(): Observable<T>
    {
        return new Observable<T>(
            subscriber =>
            {
                this._eventSubscribers = this._eventSubscribers || new Set<Subscriber<T>>();
                this._eventSubscribers.add(subscriber);

                subscriber.add(
                    () =>
                    {
                        this._eventSubscribers.delete(subscriber);
                        if(!this._eventSubscribers.size)
                            this._eventSubscribers = null;;
                    });

                subscriber.next(this._value);
            });
    }

    Map<R>(map: (t: T) => R): ISignal<R>
    {
        return new SignalExpression(
            [this],
            map);
    }

    Dispose(): void
    {
    }
}

class SignalExpression<T> extends Signal<T> implements ISchedulable
{
    private _map        : (...values) => T;
    private _in         : ISignal<any>[];
    private _longestPath: number;

    constructor(
        inputs: ISignal<any>[],
        map   : (...values) => T
        )
    {
        super(map.apply(
            null,
            inputs.map(signal => signal.Value)));
        this._map = map;
        this._in  = inputs;
        this._longestPath = this._in.reduce(
            (longestPath, signal) => Math.max(longestPath, signal.LongestPath + 1),
            0);

        for(const signal of this._in)
            signal.Subscribe(this);
    }

    get In(): ISignal<any>[]
    {
        return this._in;
    }

    get LongestPath(): number
    {
        return this._longestPath;
    }

    Dispose(): void
    {
        while(this._in.length)
        {
            const signal = this._in.pop();
            signal.Unsubscribe(this);
            if(!signal.Out.length)
                signal.Dispose();
        }
    }

    Run(
        scheduler: IScheduler
        ): void
    {
        const value = this._map.apply(
            null,
            this._in.map(signal => signal.Value)); // this._map(...this._in.map(signal => signal.Value));

        this.Update(
            value,
            scheduler);
    }
}

export function Map<T1                    , R>(s1: ISignal<T1>                                                                                     , map: (t1: T1                                        ) => R): ISignal<R>;
export function Map<T1, T2                , R>(s1: ISignal<T1>, s2: ISignal<T2>                                                                    , map: (t1: T1, t2: T2                                ) => R): ISignal<R>;
export function Map<T1, T2, T3            , R>(s1: ISignal<T1>, s2: ISignal<T2>, s3: ISignal<T3>                                                   , map: (t1: T1, t2: T2, t3: T3                        ) => R): ISignal<R>;
export function Map<T1, T2, T3, T4        , R>(s1: ISignal<T1>, s2: ISignal<T2>, s3: ISignal<T3>, s4: ISignal<T4>                                  , map: (t1: T1, t2: T2, t3: T3, t4: T4                ) => R): ISignal<R>;
export function Map<T1, T2, T3, T4, T5    , R>(s1: ISignal<T1>, s2: ISignal<T2>, s3: ISignal<T3>, s4: ISignal<T4>, s5: ISignal<T5>                 , map: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5        ) => R): ISignal<R>;
export function Map<T1, T2, T3, T4, T5, T6, R>(s1: ISignal<T1>, s2: ISignal<T2>, s3: ISignal<T3>, s4: ISignal<T4>, s5: ISignal<T5>, s6: ISignal<T6>, map: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => R): ISignal<R>;
export function Map<T, R>(inputs: ISignal<T>[], map: (...t: T[]) => R): ISignal<R>;
export function Map(...args): any
{
    let inputs: ISignal<any>[];

    if(args[0] instanceof Array)
        inputs = <ISignal<any>[]>args[0];

    else
        inputs = <ISignal<any>[]>args.slice(
            0,
            args.length - 1);

    return new SignalExpression(
        inputs,
        <() => any>args[args.length - 1]);
}

export class Scheduler extends SortedList<ISchedulable> implements IScheduler
{
    private _suspended  = 0;
    private _entryCount = 0;
    private _flushing   = false;

    constructor()
    {
        super((lhs, rhs) => lhs.LongestPath - rhs.LongestPath);
    }

    public add(
        schedulable: ISchedulable
        ): this
    {
        const indexBefore = this.lastBefore(schedulable);

        for(let index = indexBefore + 1; index < this._array.length && this._array[index].LongestPath === schedulable.LongestPath; ++index)
            if(this._array[index] === schedulable)
                // Already scheduled.
                return this;

        this._array.splice(
            indexBefore + 1,
            0,
            schedulable);

        return this;
    }

    Schedule(
        schedulable: ISchedulable
        ): void
    {
        try
        {
            this._entryCount += 1;
            if(schedulable.In.length === 1 && !this._suspended)
                // Run immediately.
                schedulable.Run(this);

            else
                this.add(schedulable);

        }
        finally
        {
            this._entryCount -= 1;
        }

        if(!this._suspended && this._entryCount === 0)
            this.Flush();
    }

    Suspend(): void
    {
        ++this._suspended;
    }

    Unsuspend(): void
    {
        --this._suspended;
        if(!this._suspended)
            this.Flush();
    }

    Update(
        update: (scheduler: IScheduler) => void
        )
    {
        try
        {
            this.Suspend();
            update(this);
        }
        finally
        {
            this.Unsuspend();
        }
    }

    *Schedulables(): IterableIterator<ISchedulable>
    {
        yield* this._array;
    }

    private Flush(): void
    {
        if(this._flushing)
            return;

        try
        {
            this._flushing = true;
            while(this._array.length)
                this._array.shift().Run(this);
        }
        finally
        {
            this._flushing = false;
        }
    }
}

//let x: ISignal<number>;
//let y: ISignal<number>;
//let z: ISignal<string>;
//x.Map((n: number) => n.toString());
//Map(x, (n: number) => n.toString());
//Map(x, y, (n1, n2) => Math.max(n1, n2));
//Map(x, z, (n1, s1) => n1.toString() + s1);
//Map([x, y], (...a) => Math.max(...a));
