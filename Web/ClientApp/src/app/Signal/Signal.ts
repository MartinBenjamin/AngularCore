import { Observable, Subscriber } from 'rxjs';
import { SortedList } from '../Collections/SortedSet';
import { LongestPaths } from '../Graph/AdjacencyList';
import { Condense } from '../Graph/StronglyConnectedComponents';

type AreEqual<T = any> = (lhs: T, rhs: T) => boolean;

type SignalParams<P> = { [Parameter in keyof P]: Signal<P[Parameter]> | CurrentValue<P[Parameter]>; };

const ReferenceEquality: AreEqual = (lhs: any, rhs: any) => lhs === rhs;

export type RemoveAction = (signal: Signal) => void;

export interface IVertex
{
    LongestPath?: number;
}

export class Signal<TOut = any, TIn extends any[] = any[]> implements IVertex
{
    private _removeActions: RemoveAction[];

    LongestPath?: number;

    constructor(
        public Function?: (...parameters: TIn) => TOut,
        public AreEqual: AreEqual<TOut> = ReferenceEquality
        )
    {
    }

    AddRemoveAction(
        removeAction: RemoveAction
        ): void
    {
        this._removeActions = this._removeActions || [];
        this._removeActions.push(removeAction);
    }

    Remove(): void
    {
        if(this._removeActions)
            while(this._removeActions.length)
                this._removeActions.pop()(this);
    }

    CurrentValue(): CurrentValue<TOut>
    {
        return new CurrentValue<TOut>(this);
    }
}

export class CurrentValue<TOut = any>
{
    constructor(
        public readonly Signal: Signal<TOut, any[]>
        )
    {
    }
}

export interface IScheduler
{
    AddSignal<TOut = any, TIn extends any[] = any[]>(
        map?: (...parameters: TIn) => TOut,
        inputs?: { [Parameter in keyof TIn]: Signal<TIn[Parameter]> | CurrentValue<TIn[Parameter]>; }): Signal<TOut>;
    AddSignals(predecessors: ReadonlyMap<Signal, ReadonlyArray<Signal | CurrentValue>>): void;
    RemoveSignal(signal: Signal): void;

    Schedule(signal: Signal): void;
    Inject(signal: Signal, value: any): void;
    Suspend(): void;
    Resume(): void;
    Update(update: (scheduler: IScheduler) => void);
    Observe<TOut>(signal: Signal<TOut>): Observable<TOut>;
}

type SCC<T> = ReadonlyArray<T> & IVertex & { Recursive?: boolean; };

export class Scheduler extends SortedList<SCC<Signal>> implements IScheduler
{
    private _predecessors               : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _successors                 : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _condensed                  : ReadonlyMap<SCC<Signal>, ReadonlyArray<SCC<Signal>>>;
    private _stronglyConnectedComponents: ReadonlyMap<Signal, SCC<Signal>>;
    private _values                     = new Map<Signal, any>();
    private _subscribers                = new Map<Signal, Set<Subscriber<any>>>();
    private _suspended                  = 0;
    private _entryCount                 = 0;
    private _flushing                   = false;

    constructor(
        predecessors?: ReadonlyMap<Signal, ReadonlyArray<Signal | CurrentValue>>,
        private _signalTrace?: (signal: Signal, value: any) => void
        )
    {
        super((lhs, rhs) => lhs.LongestPath - rhs.LongestPath);

        this._predecessors = new Map();
        this._successors   = new Map();

        if(predecessors)
            this.AddSignals(predecessors);
    }

    public AddSignal<TOut = any, TIn extends any[] = any[]>(
        map: (...parameters: TIn) => TOut,
        predecessors: SignalParams<TIn> = <SignalParams<TIn>>[]
        ): Signal<TOut>
    {
        const signal = new Signal(map);

        (<Map<Signal, Signal[]>>this._predecessors).set(
            signal,
            predecessors.map(predecessor => predecessor instanceof CurrentValue ? predecessor.Signal : predecessor));

        (<Map<Signal, Signal[]>>this._successors).set(
            signal,
            []);

        predecessors
            .filter((predecessor): predecessor is Signal => predecessor instanceof Signal)
            .forEach(predecessor => (<Signal[]>this._successors.get(predecessor)).push(signal));

        // Condense the signal graph.
        this._condensed = Condense(this._predecessors);

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

        for(const scc of this._condensed.keys())
            scc.Recursive = scc.length > 1 || this._successors.get(scc[0]).includes(scc[0]);

        try
        {
            this.Suspend();
            this.Schedule(signal);
        }
        finally
        {
            this.Resume();
        }

        return signal;
    }

    public AddSignals(
        predecessors: ReadonlyMap<Signal, ReadonlyArray<Signal | CurrentValue>>
        ): void
    {
        const signalsToBeScheduled: Signal[] = [...predecessors].filter(
            ([, predecessors]) =>
                !predecessors.length ||
                predecessors.filter((predecessor): predecessor is Signal => predecessor instanceof Signal).some(predecessor => this._predecessors.has(predecessor))).map(([signal,]) => signal);

        for(const [signal, signalPredecessors] of predecessors)
            (<Map<Signal, Signal[]>>this._predecessors).set(
                signal,
                signalPredecessors.map(predecessor => predecessor instanceof CurrentValue ? predecessor.Signal : predecessor));

        for(const signal of predecessors.keys())
            (<Map<Signal, Signal[]>>this._successors).set(
                signal,
                []);

        new Array<[Signal, Signal]>().concat(...[...predecessors]
            .map<[Signal, Signal[]]>(([signal, predecessors]) => [signal, predecessors.filter((predecessor): predecessor is Signal => predecessor instanceof Signal)])
            .map(([signal, predecessors]) => predecessors.map<[Signal, Signal]>(predecessor => [signal, predecessor])))
            .forEach(([signal, predecessor]) => (<Signal[]>this._successors.get(predecessor)).push(signal));

        // Condense the signal graph.
        this._condensed = Condense(this._predecessors);

        this._stronglyConnectedComponents = new Map<Signal, SCC<Signal>>([].concat(...[...this._condensed.keys()]
            .map(stronglyConnectedComponent => stronglyConnectedComponent
                .map<[Signal, SCC<Signal>]>(signal => [signal, stronglyConnectedComponent]))));

        // Determine longest path for each strongly connected component in the condensed graph.
        const longestPaths = LongestPaths(this._condensed);

        for(const [stronglyConnectComponent, longestPath] of longestPaths)
        {
            stronglyConnectComponent.LongestPath = longestPath;

            for(const signal of stronglyConnectComponent)
                signal.LongestPath = longestPath;
        }

        for(const scc of this._condensed.keys())
            scc.Recursive = scc.length > 1 || this._successors.get(scc[0]).includes(scc[0]);

        // Schedule new Signals which do not depend on other Signals or are dependent on existing Signals.
        try
        {
            this.Suspend();
            signalsToBeScheduled.forEach(signal => this.Schedule(signal));
        }
        finally
        {
            this.Resume();
        }
    }

    RemoveSignal(
        signal: Signal
        ): void
    {
        const stronglyConnectedComponent = this._stronglyConnectedComponents.get(signal);

        if(stronglyConnectedComponent)
            this.RemoveStronglyConnectedComponent(stronglyConnectedComponent);
    }

    private RemoveStronglyConnectedComponent(
        stronglyConnectedComponent: SCC<Signal>
        ): void
    {
        // Check for successors.
        if([...this._condensed.values()].some(predecessors => predecessors.includes(stronglyConnectedComponent)))
            // Strongly connected component has successors.
            return;

        const predecessors = this._condensed.get(stronglyConnectedComponent);

        //  Delete strongly connected component.
        (<Map<SCC<Signal>, ReadonlyArray<SCC<Signal>>>>this._condensed).delete(stronglyConnectedComponent);

        // Delete components of strongly connected component.
        for(const signal of stronglyConnectedComponent)
        {
            for(const predecessor of this._predecessors.get(signal))
            {
                const successors = <Signal[]>this._successors.get(predecessor);
                const index = successors.indexOf(signal);
                if(index !== -1)
                    successors.splice(
                        index,
                        1);
            }

            (<Map<Signal, Signal[]>>this._predecessors).delete(signal);

            (<Map<Signal, SCC<Signal>>>this._stronglyConnectedComponents).delete(signal);

            this._values.delete(signal);

            signal.Remove();
        }

        // Delete predecessor strongly connected components.
        for(const predecessor of predecessors)
            this.RemoveStronglyConnectedComponent(predecessor);
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
        if(!signal.Function)
            // Source signal - value injected.
            return;

        try
        {
            this._entryCount += 1;
            const stronglyConnectedComponent = this._stronglyConnectedComponents.get(signal);

            if(!stronglyConnectedComponent)
                throw new Error("Unknown signal");

            if(this._predecessors.get(signal).length <= 1 && !this._suspended)
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

    Inject(
        signal: Signal,
        value : any
        ): void
    {

        if(signal.AreEqual(
            value,
            this._values.get(signal)))
            return;

        this._values.set(
            signal,
            value);
        for(const successor of this._successors.get(signal))
            this.Schedule(successor);

        const subscribers = this._subscribers.get(signal);
        if(subscribers)
            subscribers.forEach(subscriber => subscriber.next(value));

        if(this._signalTrace)
            this._signalTrace(
                signal,
                value);
    }

    Suspend(): void
    {
        ++this._suspended;
    }

    Resume(): void
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
            this.Resume();
        }
    }

    Observe<TOut>(
        signal: Signal<TOut>
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
        if(!stronglyConnectedComponent.Recursive)
        {
            const signal = stronglyConnectedComponent[0]
            const value = signal.Function(...this._predecessors.get(signal).map(predecessor => this._values.get(predecessor)));

            if(!signal.AreEqual(
                value,
                this._values.get(signal)))
            {
                this._values.set(
                    signal,
                    value);
                for(const successor of this._successors.get(signal))
                    this.Schedule(successor);

                const subscribers = this._subscribers.get(signal);
                if(subscribers)
                    subscribers.forEach(subscriber => subscriber.next(value));

                if(this._signalTrace)
                    this._signalTrace(
                        signal,
                        value);
            }
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
                        signal.Function.apply(
                            null,
                            this._predecessors.get(signal).map(predecessor => this._values.get(predecessor))));

                let count = schedule.length;
                while(count--)
                {
                    const signal = schedule.shift();
                    const nextValue = nextValues.get(signal);
                    if(!signal.AreEqual(
                        this._values.get(signal),
                        nextValue))
                    {
                        for(const successor of this._successors.get(signal))
                            if(successor.LongestPath === signal.LongestPath &&
                               !schedule.includes(successor))
                                schedule.push(successor);

                        this._values.set(
                            signal,
                            nextValue);
                    }
                }
            }

            for(const signal of stronglyConnectedComponent)
            {
                for(const successor of this._successors.get(signal))
                    if(successor.LongestPath > signal.LongestPath) // Do not schedule signals within the strongly connected component.
                        this.Schedule(successor);

                const subscribers = this._subscribers.get(signal);
                if(subscribers)
                    subscribers.forEach(subscriber => subscriber.next(this._values.get(signal)));

                if(this._signalTrace)
                    this._signalTrace(
                        signal,
                        this._values.get(signal));
            }
        }
    }
}
