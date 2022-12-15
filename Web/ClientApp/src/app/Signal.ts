import { Observable, Subscriber } from 'rxjs';
import { LongestPaths, Transpose } from './Ontology/AdjacencyList';
import { SortedList } from './Ontology/SortedSet';
import { Condense } from './Ontology/StronglyConnectedComponents';

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

class CurrentValue<TOut = any>
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
        map: (...parameters: TIn) => TOut,
        inputs: { [Parameter in keyof TIn]: Signal<TIn[Parameter]> | CurrentValue<TIn[Parameter]>; }
    ): Signal<TOut>
    AddSignals(inputToOutputs: ReadonlyMap<Signal, ReadonlyArray<Signal | CurrentValue>>): void
    RemoveSignal(signal: Signal): void

    Schedule(signal: Signal): void
    Suspend(): void;
    Unsuspend(): void;
    Update(update: (scheduler: IScheduler) => void);
    Observe<TOut>(signal: Signal<TOut>): Observable<TOut>;
}

type SCC<T> = ReadonlyArray<T> & IVertex;

export class Scheduler extends SortedList<SCC<Signal>> implements IScheduler
{
    private _inputToOutputs             : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _outputToInputs             : ReadonlyMap<Signal, ReadonlyArray<Signal>>;
    private _condensed                  : ReadonlyMap<SCC<Signal>, ReadonlyArray<SCC<Signal>>>;
    private _stronglyConnectedComponents: ReadonlyMap<Signal, SCC<Signal>>;
    private _values                     = new Map<Signal, any>();
    private _subscribers                = new Map<Signal, Set<Subscriber<any>>>();
    private _suspended                  = 0;
    private _entryCount                 = 0;
    private _flushing                   = false;

    constructor(
        inputToOutputs?: ReadonlyMap<Signal, ReadonlyArray<Signal | CurrentValue>>,
        private _signalTrace?: (signal: Signal, value: any) => void
        )
    {
        super((lhs, rhs) => lhs.LongestPath - rhs.LongestPath);

        this._inputToOutputs = new Map();
        this._outputToInputs = new Map();

        if(inputToOutputs)
            this.AddSignals(inputToOutputs);
        return;
        /*
        this._inputToOutputs = new Map(
            [...inputToOutputs].map(([input, outputs]) => [input, outputs.map(output => output instanceof CurrentValue ? output.Signal : output)]));

        // Determine the transpose.
        this._outputToInputs = Transpose(
            new Map([...inputToOutputs].map(([input, outputs]) => [input, outputs.filter((output): output is Signal => output instanceof Signal)])));

        // Condense the signal graph.
        this._condensed = Condense(this._inputToOutputs);

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

        // Schedule signals with LongestPath 0.
        try
        {
            this.Suspend();
            for(const signal of this._inputToOutputs.keys())
                if(signal.LongestPath === 0)
                    this.Schedule(signal);
        }
        finally
        {
            this.Unsuspend();
        }
        */
    }

    public AddSignal<TOut = any, TIn extends any[] = any[]>(
        map: (...parameters: TIn) => TOut,
        inputs: SignalParams<TIn> = <SignalParams<TIn>>[]
        ): Signal<TOut>
    {
        const signal = new Signal(map);

        (<Map<Signal, Signal[]>>this._inputToOutputs).set(
            signal,
            inputs.map(output => output instanceof CurrentValue ? output.Signal : output));

        (<Map<Signal, Signal[]>>this._outputToInputs).set(
            signal,
            []);

        inputs
            .filter((output): output is Signal => output instanceof Signal)
            .forEach(output => (<Signal[]>this._outputToInputs.get(output)).push(signal));

        // Condense the signal graph.
        this._condensed = Condense(this._inputToOutputs);

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

        try
        {
            this.Suspend();
            this.Schedule(signal);
        }
        finally
        {
            this.Unsuspend();
        }

        return signal;
    }

    public AddSignals(
        inputToOutputs: ReadonlyMap<Signal, ReadonlyArray<Signal | CurrentValue>>
        ): void
    {
        const signalsToBeScheduled: Signal[] = [...inputToOutputs].filter(
            ([, outputs]) =>
                !outputs.length ||
                outputs.filter((output): output is Signal => output instanceof Signal).some(output => this._inputToOutputs.has(output))).map(([signal,]) => signal);

        for(const [input, outputs] of inputToOutputs)
            (<Map<Signal, Signal[]>>this._inputToOutputs).set(
                input,
                outputs.map(output => output instanceof CurrentValue ? output.Signal : output));

        for(const input of inputToOutputs.keys())
            (<Map<Signal, Signal[]>>this._outputToInputs).set(
                input,
                []);

        new Array<[Signal, Signal]>().concat(...[...inputToOutputs]
            .map<[Signal, Signal[]]>(([input, outputs]) => [input, outputs.filter((output): output is Signal => output instanceof Signal)])
            .map(([input, outputs]) => outputs.map<[Signal, Signal]>(output => [output, input]))).forEach(
                ([output, input]) => (<Signal[]>this._outputToInputs.get(output)).push(input));

        // Condense the signal graph.
        this._condensed = Condense(this._inputToOutputs);

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

        // Schedule new Signals which do not depend on other Signals or are dependent on existing Signals.
        try
        {
            this.Suspend();
            signalsToBeScheduled.forEach(signal => this.Schedule(signal));
        }
        finally
        {
            this.Unsuspend();
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
        // Check for descendents.
        if([...this._condensed.values()].some(ancestors => ancestors.includes(stronglyConnectedComponent)))
            // Strongly connected component has descendents.
            return;

        const ancestors = this._condensed.get(stronglyConnectedComponent);

        //  Delete strongly connected component.
        (<Map<SCC<Signal>, ReadonlyArray<SCC<Signal>>>>this._condensed).delete(stronglyConnectedComponent);

        // Delete components of strongly connected component.
        for(const signal of stronglyConnectedComponent)
        {
            for(const output of this._inputToOutputs.get(signal))
            {
                const inputs =  <Signal[]>this._outputToInputs.get(output);
                const index = inputs.indexOf(signal);
                if(index !== -1)
                    inputs.splice(
                        index,
                        1);
            }

            (<Map<Signal, Signal[]>>this._inputToOutputs).delete(signal);

            (<Map<Signal, SCC<Signal>>>this._stronglyConnectedComponents).delete(signal);

            signal.Remove();
        }

        // Delete sncestor strongly connected components.
        for(const ancestor of ancestors)
            this.RemoveStronglyConnectedComponent(ancestor);
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

            if(!stronglyConnectedComponent)
                throw new Error("Unknown signal");

            if(this._inputToOutputs.get(signal).length === 1 && !this._suspended)
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
        if(stronglyConnectedComponent.length === 1)
        {
            const signal = stronglyConnectedComponent[0]
            const value = signal.Function.apply(
                null,
                this._inputToOutputs.get(signal).map(output => this._values.get(output)));

            if(!signal.AreEqual(
                value,
                this._values.get(signal)))
            {
                this._values.set(
                    signal,
                    value);
                for(const input of this._outputToInputs.get(signal))
                    this.Schedule(input);

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
                            this._inputToOutputs.get(signal).map(output => this._values.get(output))));

                let count = schedule.length;
                while(count--)
                {
                    const signal = schedule.shift();
                    const nextValue = nextValues.get(signal);
                    if(!signal.AreEqual(
                        this._values.get(signal),
                        nextValue))
                    {
                        for(const input of this._outputToInputs.get(signal))
                            if(input.LongestPath === signal.LongestPath &&
                                !schedule.includes(input))
                                schedule.push(input);

                        this._values.set(
                            signal,
                            nextValue);
                    }
                }
            }

            for(const signal of stronglyConnectedComponent)
            {
                for(const input of this._outputToInputs.get(signal))
                    if(input.LongestPath > signal.LongestPath) // Do not schedule signals within the strongly connected component.
                        this.Schedule(input);

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
