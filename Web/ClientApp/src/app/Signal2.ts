import { Observable, Subscriber } from 'rxjs';
import { LongestPaths, Transpose } from './Ontology/AdjacencyList';
import { SortedList } from './Ontology/SortedSet';
import { Condense } from './Ontology/StronglyConnectedComponents';

export interface IVertex
{
    LongestPath?: number;
}

export class Signal implements IVertex
{
    LongestPath?: number;

    constructor(
        public Map?: (...parameters: any) => any,
        public AreEqual?: (lhs: any, rhs: any) => boolean
        )
    {
    }

    CurrentValue(): CurrentValue
    {
        return new CurrentValue(this);
    }
}

class CurrentValue
{
    constructor(
        public readonly Signal: Signal
        )
    {
    }
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

type SCC<T> = ReadonlyArray<T> & IVertex;

export class Scheduler extends SortedList<SCC<Signal>> implements IScheduler
{
    private _inputOutputMap             : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _outputInputMap             : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _condensed                  : ReadonlyMap<SCC<Signal>, ReadonlyArray<SCC<Signal>>>;
    private _stronglyConnectedComponents: ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _values                     = new Map<Signal, any>();
    private _subscribers                = new Map<Signal, Set<Subscriber<any>>>();
    private _suspended                  = 0;
    private _entryCount                 = 0;
    private _flushing                   = false;

    constructor(
        inputOutputMap: ReadonlyMap<Signal, ReadonlyArray<Signal|CurrentValue>>
        )
    {
        super((lhs, rhs) => lhs.LongestPath - rhs.LongestPath);

        this._inputOutputMap = new Map(
            [...inputOutputMap].map(([signal, inputs]) => [signal, inputs.map(input => input instanceof CurrentValue ? input.Signal : input)]));

        // Determine the transpose.
        this._outputInputMap = Transpose(
            new Map([...inputOutputMap].map(([signal, inputs]) => [signal, inputs.filter((input): input is Signal => input instanceof Signal)])));

        // Condense the signal graph.
        this._condensed = Condense(this._inputOutputMap);

        this._stronglyConnectedComponents = new Map<Signal, SCC<Signal>>([].concat(...[...this._condensed.keys()]
            .map(stronglyConnectedComponent => stronglyConnectedComponent
                .map<[Signal, SCC<Signal>]>(signal => [signal, stronglyConnectedComponent]))));

        // Determine longest path for each strongly connect component in condensed graph.
        const longestPaths = LongestPaths(this._condensed);

        for(const [stronglyConnectComponent, longestPath] of longestPaths)
        {
            stronglyConnectComponent.LongestPath = longestPath;

            for(const signal of stronglyConnectComponent)
                signal.LongestPath = longestPath;
        }
    }

    public add(
        stronglyConnectedComponent: SCC<Signal>
        ): this
    {
        const indexBefore = this.lastBefore(stronglyConnectedComponent);

        for(let index = indexBefore + 1; index < this._array.length && this._compare(this._array[index], stronglyConnectedComponent) === 0; ++index)
            if(this._array[index] === stronglyConnectedComponent)
                // Already scheduled.
                return this;

        this._array.splice(
            indexBefore + 1,
            0,
            stronglyConnectedComponent);

        return this;
    }

    Schedule(
        signal: Signal
        ): void
    {
        try
        {
            this._entryCount += 1;
            const stronglyConnectedComponent = this._stronglyConnectedComponents.get(signal);
            if(this._inputOutputMap.get(signal).length === 1 && !this._suspended)
                // Run immediately.
                this.Run(stronglyConnectedComponent);

            else
                this.add(stronglyConnectedComponent);
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
        stronglyConnectedComponent: SCC<Signal>
        )
    {
        if(stronglyConnectedComponent.length === 1)
        {
            const signal = stronglyConnectedComponent[0]
            if(signal.Map)
                this.SetValue(
                    signal,
                    signal.Map.apply(
                        null,
                        this._inputOutputMap.get(signal).map(output => this._values.get(output))));
        }
        else
        {
            for(const signal of stronglyConnectedComponent)
                this._values.delete(signal);

            const nextValues = new Map<Signal, any>();
            const schedule: Signal[] = [...stronglyConnectedComponent];
            while(schedule.length)
            {
                for(const signal of schedule)
                    nextValues.set(
                        signal,
                        signal.Map.apply(
                            null,
                            this._inputOutputMap.get(signal).map(output => this._values.get(output))));

                let count = schedule.length;
                while(count--)
                {
                    const signal = schedule.shift();
                    const areEqual = signal.AreEqual || ((lhs, rhs) => lhs === rhs);
                    if(!areEqual(
                        this._values.get(signal),
                        nextValues.get(signal)))
                    {
                        for(const input of this._outputInputMap.get(signal))
                            if(input.LongestPath === signal.LongestPath &&
                                !schedule.includes(input))
                                schedule.push(input);

                        this._values.set(
                            signal,
                            nextValues.get(signal));
                    }
                }
            }

            for(const signal of stronglyConnectedComponent)
            {
                for(const input of this._outputInputMap.get(signal))
                    if(input.LongestPath > signal.LongestPath) // Do not schedule signals within the strongly connected component.
                        this.Schedule(input);

                const subscribers = this._subscribers.get(signal);
                if(subscribers)
                    subscribers.forEach(subscriber => subscriber.next(this._values.get(signal)));
            }
        }
    }
}
