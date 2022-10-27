import { Observable, Subscriber } from 'rxjs';
import { LongestPaths, Transpose } from './Ontology/AdjacencyList';
import { SortedList } from './Ontology/SortedSet';
import { Condense } from './Ontology/StronglyConnectedComponents';

export interface IVertex
{
    LongestPath?: number;
}

export interface Signal extends IVertex
{
    Map?: (...parameters: any) => any;
}

export interface IScheduler
{
    SetValue(
        signal: Signal,
        value: any);
    Suspend(): void;
    Unsuspend(): void;
    Update(update: (scheduler: IScheduler) => void);
    Observe<TOut>(signal: Signal): Observable<TOut>;
}

export class Scheduler extends SortedList<Signal> implements IScheduler
{
    private _inputOutputMap: Map<Signal, Signal[]>;
    private _values        = new Map<Signal, any>();
    private _subscribers   = new Map<Signal, Set<Subscriber<any>>>();
    private _suspended     = 0;
    private _entryCount    = 0;
    private _flushing      = false;

    constructor(
        private _outputInputMap: Map<Signal, Signal[]>
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
        signal: Signal
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
        signal: Signal
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

    SetValue(
        signal: Signal,
        value: any
        )
    {
        const current = this._values.get(signal);
        if(current !== value)
        {
            this._values.set(
                signal,
                value);
            for(const input of this._outputInputMap.get(signal))
                this.Schedule(input);

            const subscribers = this._subscribers.get(signal);
            if(subscribers)
                subscribers.forEach(subscriber => subscriber.next(value));
        }
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

    Observe<TOut>(
        signal: Signal
        ): Observable<TOut>
    {
        return new Observable<TOut>(
            subscriber =>
            {
                let subscribers = this._subscribers.get(signal);
                if(!subscribers)
                {
                    subscribers = new Set<Subscriber<any>>();
                    this._subscribers.set(
                        signal,
                        subscribers);
                }

                subscribers.add(subscriber);

                subscriber.add(
                    () =>
                    {
                        subscribers.delete(subscriber);
                        if(!subscribers.size)
                            this._subscribers.delete(signal);
                    });

                subscriber.next(this._values.get(signal));
            });
    }

    *Signals(): IterableIterator<Signal>
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
        signal: Signal
        )
    {
        if(signal.Map)
            this.SetValue(
                signal,
                signal.Map.apply(
                    null,
                    this._inputOutputMap.get(signal).map(output => this._values.get(output))));
    }
}
