import { Observable, Subscriber } from 'rxjs';
import { SortedList } from './Ontology/SortedSet';
import { StronglyConnectedComponents, Condense } from './Ontology/StronglyConnectedComponents';
import { LongestPaths, Transpose } from './Ontology/AdjacencyList';

export interface Signal<TIn, TOut>
{
    Value?: TOut;
    LongestPath?: number;
    Map?: (...parameters: TIn[]) => TOut;
    FixedPoint?: (lhs: TOut, rhs: TOut) => boolean;
    Subscribers: Set<Subscriber<TOut>>
}

//export interface IVertex
//{
//    readonly In : ReadonlyArray<IVertex>;
//    readonly Out: ReadonlyArray<IVertex>;
//    LongestPath : number;
//}

//export interface ISchedulable extends IVertex
//{
//    Run(): void;
//}

export interface IScheduler
{
    Suspend(): void;
    Unsuspend(): void;
    Update(update: (scheduler: IScheduler) => void);
}

//interface ISchedulerInternal
//{
//    Schedule(schedulable: ISchedulable): void;
//    Add<TInput extends IVertex, TOuput extends IVertex>(
//        vertex: IVertex,
//        inputs: TInput[],
//        outputs: TOuput[]
//    ): [readonly TInput[], readonly TOuput[]]
//    Remove(vertex: IVertex): void;
//    AddEdge(
//        outgoing: IVertex,
//        incoming: IVertex): void;
//    RemoveEdge(
//        outgoing: IVertex,
//        incoming: IVertex): void;
//}

//export interface ISignal<T> extends IVertex
//{
//    readonly Out  : ReadonlyArray<ISchedulable>;
//    readonly Value: T;

//    Subscribe(schedulable: ISchedulable): void;
//    Unsubscribe(schedulable: ISchedulable): void;

//    Update(value: T): void;

//    Observe(): Observable<T>;

//    Map<R>(map: (t: T) => R): ISignal<R>;

//    Dispose(): void;
//}


//export class Signal<T> implements ISignal<T>
//{
//    private   _value           : T;
//    private   _eventSubscribers: Set<Subscriber<T>>;
//    protected _in              : ReadonlyArray<ISignal<any>>;
//    protected _out             : ReadonlyArray<ISchedulable>

//    public LongestPath: number;

//    constructor(
//        protected _scheduler: ISchedulerInternal,
//        inputs              : ISignal<any>[] = [],
//        outputs             : ISchedulable[] = []
//        )
//    {
//        [this._in, this._out] = this._scheduler.Add(
//            this,
//            inputs,
//            outputs);
//    }

//    get In(): ReadonlyArray<ISignal<any>>
//    {
//        return this._in;
//    }

//    get Out(): ReadonlyArray<ISchedulable>
//    {
//        return this._out;
//    }

//    get Value(): T
//    {
//        return this._value;
//    }

//    Subscribe(
//        schedulable: ISchedulable
//        ): void
//    {
//        this._scheduler.AddEdge(this, schedulable);
//    }

//    Unsubscribe(
//        schedulable: ISchedulable
//        ): void
//    {
//        this._scheduler.RemoveEdge(this, schedulable);
//    }

//    Update(
//        value: T
//        ): void
//    {
//        this._value = value;
//        for(const schedulable of this._out)
//            this._scheduler.Schedule(schedulable);

//        if(this._eventSubscribers)
//            this._eventSubscribers.forEach(subscriber => subscriber.next(this._value));
//    }

//    Observe(): Observable<T>
//    {
//        return new Observable<T>(
//            subscriber =>
//            {
//                this._eventSubscribers = this._eventSubscribers || new Set<Subscriber<T>>();
//                this._eventSubscribers.add(subscriber);

//                subscriber.add(
//                    () =>
//                    {
//                        this._eventSubscribers.delete(subscriber);
//                        if(!this._eventSubscribers.size)
//                            this._eventSubscribers = null;;
//                    });

//                subscriber.next(this._value);
//            });
//    }

//    Map<R>(map: (t: T) => R): ISignal<R>
//    {
//        return new SignalExpression(
//            this._scheduler,
//            [this],
//            map);
//    }

//    Dispose(): void
//    {
//        this._scheduler.Remove(this);
//    }
//}

//class SignalExpression<T> extends Signal<T> implements ISchedulable
//{
//    private _map: (...values) => T;

//    constructor(
//        scheduler: ISchedulerInternal,
//        inputs   : ISignal<any>[],
//        map      : (...values) => T
//        )
//    {
//        super(
//            scheduler,
//            inputs);
//        this._map = map;
//    }

//    Run(): void
//    {
//        const value = this._map.apply(
//            null,
//            this._in.map(signal => signal.Value)); // this._map(...this._in.map(signal => signal.Value));

//        this.Update(value);
//    }
//}

export class Scheduler extends SortedList<Signal<any, any>> implements IScheduler
{
    private _inputOutputMap: Map<Signal<any, any>, Signal<any, any>[]>;
    private _suspended     = 0;
    private _entryCount    = 0;
    private _flushing      = false;

    constructor(
        private _outputInputMap: Map<Signal<any, any>, Signal<any, any>[]>
        )
    {
        super((lhs, rhs) => lhs.LongestPath - rhs.LongestPath);

        // Determine the transpose.
        this._inputOutputMap = Transpose(this._outputInputMap)

        // Condense the transpose.
        const condensed = Condense(this._inputOutputMap);

        // Determine longest path for each strongly connect component in condensed graph.
        const longestPaths = LongestPaths(condensed);

        for(const [stronglyConnectComponent, longestPath] of longestPaths)
            // Each vertex of the strongly connect component get assigned the longest path of the strongly connect component.
            for(const vertex of stronglyConnectComponent)
                vertex.LongestPath = longestPath;
    }

    public add(
        signal: Signal<any, any>
        ): this
    {
        const indexBefore = this.lastBefore(signal);

        for(let index = indexBefore + 1; index < this._array.length && this._array[index].LongestPath === signal.LongestPath; ++index)
            if(this._array[index] === signal)
                // Already scheduled.
                return this;

        this._array.splice(
            indexBefore + 1,
            0,
            signal);

        return this;
    }

    Schedule(
        signal: Signal<any, any>
        ): void
    {
        try
        {
            this._entryCount += 1;
            if(this._inputOutputMap.get(signal).length === 1 && !this._suspended)
                // Run immediately.
                this.Run(signal);

            else
                this.add(signal);

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

    *Signals(): IterableIterator<Signal<any, any>>
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
                this.Run(this._array.shift());
        }
        finally
        {
            this._flushing = false;
        }
    }

    private Run(
        signal: Signal<any, any>
        )
    {
        if(signal.Map)
        {
            const nextValue = signal.Map.apply(
                null,
                this._inputOutputMap.get(signal).map(output => output.Value));

            if(nextValue != signal.Value)
            {
                signal.Value = nextValue;
                for(const input of this._outputInputMap.get(signal))
                    this.Schedule(input);

                if(signal.Subscribers)
                    signal.Subscribers.forEach(subscriber => subscriber.next(signal.Value));
            }
        }
    }
}

