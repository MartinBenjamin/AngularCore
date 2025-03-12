import { Observable, Subscriber } from 'rxjs';
import { SortedList } from '../Collections/SortedSet';
import { LongestPaths, Transpose } from '../Graph/AdjacencyList';
import { Condense } from '../Graph/StronglyConnectedComponents';

type AreEqual<T = any> = (lhs: T, rhs: T) => boolean;

type SignalParams<P> = { [Parameter in keyof P]: Signal<P[Parameter]>; };

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
}

export interface IScheduler
{
    AddSignal<TOut = any, TIn extends any[] = any[]>(
        map?: (...parameters: TIn) => TOut,
        inputs?: SignalParams<TIn>): Signal<TOut>;
    AddSignals(predecessors: ReadonlyMap<Signal, ReadonlyArray<Signal>>): void;
    RemoveSignal(signal: Signal): void;

    Suspend(): void;
    Resume(): void;
    Update(update: (scheduler: IScheduler) => void);
    Inject(signal: Signal, value: any): void;
    Sample<TOut>(signal: Signal<TOut>): TOut;
    Observe<TOut>(signal: Signal<TOut>): Observable<TOut>;
}

type SCC<T> = ReadonlyArray<T> & IVertex & { Recursive?: boolean; };

export class Scheduler extends SortedList<SCC<Signal>> implements IScheduler
{
    private _predecessors               : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _successors                 : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _sccPredecessors            : ReadonlyMap<SCC<Signal>, ReadonlyArray<SCC<Signal>>>;
    private _sccSuccessors              : ReadonlyMap<SCC<Signal>, ReadonlyArray<SCC<Signal>>>;
    private _stronglyConnectedComponents: ReadonlyMap<Signal, SCC<Signal>>;
    private _values                     = new Map<Signal, any>();
    private _subscribers                = new Map<Signal, Set<Subscriber<any>>>();
    private _suspended                  = 0;
    private _entryCount                 = 0;
    private _flushing                   = false;

    constructor(
        predecessors?: ReadonlyMap<Signal, ReadonlyArray<Signal>>,
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

        (<Map<Signal, ReadonlyArray<Signal>>>this._predecessors).set(
            signal,
            predecessors);

        (<Map<Signal, ReadonlyArray<Signal>>>this._successors).set(
            signal,
            []);

        predecessors
            .forEach(predecessor => (<Signal[]>this._successors.get(predecessor)).push(signal));

        // Condense the signal graph.
        this._sccPredecessors = Condense(this._predecessors);
        this._sccSuccessors   = Transpose(this._sccPredecessors);

        this._stronglyConnectedComponents = new Map<Signal, SCC<Signal>>([...this._sccPredecessors.keys()].flatMap(scc => scc.map(component => [component, scc])));

        // Determine longest path for each strongly connect component in condensed graph.
        const longestPaths = LongestPaths(this._sccPredecessors);

        for(const [stronglyConnectComponent, longestPath] of longestPaths)
        {
            stronglyConnectComponent.LongestPath = longestPath;

            for(const signal of stronglyConnectComponent)
                signal.LongestPath = longestPath;
        }

        for(const scc of this._sccPredecessors.keys())
            scc.Recursive = scc.length > 1 || this._successors.get(scc[0]).includes(scc[0]);

        this.Schedule(this._stronglyConnectedComponents.get(signal));

        return signal;
    }

    public AddSignals(
        predecessors: ReadonlyMap<Signal, ReadonlyArray<Signal>>
        ): void
    {
        const signalsToBeScheduled: Signal[] = [...predecessors].filter(
            ([, predecessors]) =>
                !predecessors.length ||
                predecessors.some(predecessor => this._predecessors.has(predecessor))).map(([signal,]) => signal);

        for(const [signal, signalPredecessors] of predecessors)
        {
            (<Map<Signal, ReadonlyArray<Signal>>>this._predecessors).set(
                signal,
                signalPredecessors);

            (<Map<Signal, ReadonlyArray<Signal>>>this._successors).set(
                signal,
                []);
        }

        for(const [signal, signalPredecessors] of predecessors)
            for(const signalPredecessor of signalPredecessors)
                (<Signal[]>this._successors.get(signalPredecessor)).push(signal);

        // Condense the signal graph.
        this._sccPredecessors = Condense(this._predecessors);
        this._sccSuccessors   = Transpose(this._sccPredecessors);

        this._stronglyConnectedComponents = new Map<Signal, SCC<Signal>>([...this._sccPredecessors.keys()].flatMap(scc => scc.map(component => [component, scc])));

        // Determine longest path for each strongly connected component in the condensed graph.
        const longestPaths = LongestPaths(this._sccPredecessors);

        for(const [stronglyConnectComponent, longestPath] of longestPaths)
        {
            stronglyConnectComponent.LongestPath = longestPath;

            for(const signal of stronglyConnectComponent)
                signal.LongestPath = longestPath;
        }

        for(const scc of this._sccPredecessors.keys())
            scc.Recursive = scc.length > 1 || this._successors.get(scc[0]).includes(scc[0]);

        // Schedule new Signals which do not depend on other Signals or are dependent on existing Signals.
        this.Schedule(...signalsToBeScheduled.map(signal => this._stronglyConnectedComponents.get(signal)));
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
        if(this._sccSuccessors.get(stronglyConnectedComponent).length)
            // Strongly connected component has successors.
            return;

        const predecessors = this._sccPredecessors.get(stronglyConnectedComponent);

        //  Delete strongly connected component.
        for(const predecessor of predecessors)
        {
            const successors = <SCC<Signal>[]>this._sccSuccessors.get(predecessor);
            const index = successors.indexOf(stronglyConnectedComponent);
            if(index !== -1)
                successors.splice(
                    index,
                    1);
        }

        (<Map<SCC<Signal>, ReadonlyArray<SCC<Signal>>>>this._sccPredecessors).delete(stronglyConnectedComponent);

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

    Inject(
        signal: Signal,
        value : any
        ): void
    {
        this._values.set(
            signal,
            value);

        if(this._signalTrace)
            this._signalTrace(
                signal,
                value);

        const subscribers = this._subscribers.get(signal);
        if(subscribers)
            subscribers.forEach(subscriber => subscriber.next(value));

        this.Schedule(...this._sccSuccessors.get(this._stronglyConnectedComponents.get(signal)));
    }

    Sample<TOut>(
        signal: Signal<TOut>
        ): TOut
    {
        return this._values.get(signal);
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

    private Schedule(
        ...stronglyConnectedComponents: SCC<Signal>[]
        ): void
    {
        try
        {
            this._entryCount += 1;
            for(const stronglyConnectedComponent of stronglyConnectedComponents)
                if(!(stronglyConnectedComponent.length === 1 && !stronglyConnectedComponent[0].Function)) // Do not schedule input signals.
                    this.add(stronglyConnectedComponent);
        }
        finally
        {
            this._entryCount -= 1;
        }

        if(!this._suspended && this._entryCount === 0)
            this.Flush();
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

            this._values.set(
                signal,
                value);

            if(this._signalTrace)
                this._signalTrace(
                    signal,
                    value);

            const subscribers = this._subscribers.get(signal);
            if(subscribers)
                subscribers.forEach(subscriber => subscriber.next(value));

            this.Schedule(...this._sccSuccessors.get(stronglyConnectedComponent));
        }
        else
        {
            for(const signal of stronglyConnectedComponent)
                this._values.delete(signal);

            const nextValues = new Map<Signal, any>();
            stronglyConnectedComponent.forEach(
                signal => nextValues.set(
                    signal,
                    signal.Function(...this._predecessors.get(signal).map(predecessor => this._values.get(predecessor)))));

            while(stronglyConnectedComponent.some(signal => !signal.AreEqual(
                this._values.get(signal),
                nextValues.get(signal))))
            {
                stronglyConnectedComponent.forEach(
                    signal => this._values.set(
                        signal,
                        nextValues.get(signal)));

                stronglyConnectedComponent.forEach(
                    signal => nextValues.set(
                        signal,
                        signal.Function(...this._predecessors.get(signal).map(predecessor => this._values.get(predecessor)))));
            }

            for(const signal of stronglyConnectedComponent)
            {
                if(this._signalTrace)
                    this._signalTrace(
                        signal,
                        this._values.get(signal));

                const subscribers = this._subscribers.get(signal);
                if(subscribers)
                    subscribers.forEach(subscriber => subscriber.next(this._values.get(signal)));
            }

            this.Schedule(...this._sccSuccessors.get(stronglyConnectedComponent));
        }
    }
}
