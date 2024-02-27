import { ArrayKeyedMap } from "../Collections/ArrayKeyedMap";
import { Group } from "../Collections/Group";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { Transpose } from "../Graph/AdjacencyList";
import { StronglyConnectedComponents } from "../Graph/StronglyConnectedComponents";
import { WrapperType } from "../Ontology/Wrapped";
import { IScheduler, Scheduler, Signal } from "../Signal/Signal";
import { Atom, Conjunction, Disjunction, Idb, IsIdb, Rule } from "./Datalog";
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { Fact, IEavStore } from "./IEavStore";
import { Tuple } from "./Tuple";

export class DatalogSignalInterpreter implements IDatalogInterpreter<WrapperType.Signal>
{
    private readonly _disjunction: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>;

    constructor(
        private readonly _eavStore    : IEavStore,
        private readonly _tupleCompare: Compare<Tuple>
        )
    {
        this._disjunction = Disjunction(_tupleCompare);
    }

    Query<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]): Signal<{[K in keyof T]: any;}[]>
    {
        rules = [[['', ...head], body], ...rules];

        const rulesGroupedByPredicateSymbol = Group(
            rules,
            rule => rule[0][0],
            rule => rule);

        const rulePredecessors = new Map(
            rules.map<[string, string[]]>(
                rule => [
                    rule[0][0],
                    [].concat(...rulesGroupedByPredicateSymbol.get(rule[0][0]).map(rule => rule[1].filter(IsIdb).map(idb => idb[0])))]));
        const ruleSuccessors = Transpose(rulePredecessors);

        type SCC<T> = ReadonlyArray<T> & { Recursive?: boolean; };
        const stronglyConnectedComponents: SCC<string>[] = StronglyConnectedComponents(rulePredecessors);
        stronglyConnectedComponents.forEach(scc => scc.Recursive = scc.length > 1 || rulePredecessors.get(scc[0]).includes(scc[0]));

        const signalAdjacencyList = new Map<Signal, Signal[]>();
        const idbSignals = new Map<string, Signal<Iterable<Tuple>>>();
        const signalPredecessorAtoms = new Map<Signal, (Fact | Idb)[]>();

        for(const stronglyConnectedComponent of stronglyConnectedComponents.values())
        {
            if(stronglyConnectedComponent.Recursive)
            {
                let recursion: (...inputs: Iterable<Tuple>[]) => Map<string, SortedSet<Tuple>>;
                let predecessorAtoms: (Fact | Idb)[];
                [recursion, predecessorAtoms]
                    = this.Recursion(new Map(stronglyConnectedComponent
                        .map(predicateSymbol =>
                            <[string, Rule[]]>[predicateSymbol, rulesGroupedByPredicateSymbol
                                .get(predicateSymbol)
                                .filter(rule => stronglyConnectedComponent.includes(rule[0][0]))])));
                const recursionSignal = new Signal(recursion);
                signalPredecessorAtoms.set(
                    recursionSignal,
                    predecessorAtoms);
                stronglyConnectedComponent
                    .filter(predicateSymbol => predicateSymbol === '' || ruleSuccessors.get(predicateSymbol).length)
                    .forEach(predicateSymbol =>
                    {
                        const signal = new Signal((recursionOutput: Map<string, SortedSet<Tuple>>) => <Tuple[]>recursionOutput.get(predicateSymbol).Array);
                        signalAdjacencyList.set(
                            signal,
                            [recursionSignal])
                        idbSignals.set(
                            predicateSymbol,
                            signal);
                    });
            }
            else
            {
                const predicateSymbol = stronglyConnectedComponent[0];
                const rules = rulesGroupedByPredicateSymbol.get(predicateSymbol);
                if(rules.length === 1)
                {
                    const rule = rules[0];
                    const conjunction = new Signal(Conjunction(
                        rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                        rule[1]));
                    idbSignals.set(
                        predicateSymbol,
                        conjunction);
                    signalPredecessorAtoms.set(
                        conjunction,
                        rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'));
                }
                else // Disjunction of conjunctions.
                {
                    const disjunction = new Signal(this._disjunction);
                    idbSignals.set(
                        predicateSymbol,
                        disjunction);
                    const predecessors: Signal[] = [];
                    signalAdjacencyList.set(
                        disjunction,
                        predecessors);

                    for(const rule of rules)
                    {
                        const conjunction = new Signal(Conjunction(
                            rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                            rule[1]));
                        predecessors.push(conjunction);
                        signalPredecessorAtoms.set(
                            conjunction,
                            rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'));
                    }
                }
            }
        }

        for(const [signal, predecessorAtoms] of signalPredecessorAtoms)
        {
            const predecessors: Signal[] = [];
            signalAdjacencyList.set(
                signal,
                predecessors);
            for(const atom of predecessorAtoms)
                if(IsIdb(atom))
                    predecessors.push(idbSignals.get(atom[0]));

                else 
                    predecessors.push(this._eavStore.Signal(atom));
        }

        this._eavStore.SignalScheduler.AddSignals(signalAdjacencyList);
        return <Signal>idbSignals.get('');
    }

    private Recursion(
        rulesGroupedByPredicateSymbol: Map<string, Rule[]>
        ): [(...inputs: Iterable<Tuple>[]) => Map<string, SortedSet<Tuple>>, (Fact | Idb)[]]
    {
        const signalAdjacencyList = new Map<Signal, Signal[]>();
        const empty = new SortedSet(this._tupleCompare);
        const resultT0 = new Map([...rulesGroupedByPredicateSymbol.keys()].map(([predicateSymbol,]) => [predicateSymbol, empty]));
        const resultTMinus1Signal = new Signal<Map<string, SortedSet<Tuple>>>();
        signalAdjacencyList.set(resultTMinus1Signal, []);
        const resultTMinus1Signals = new Map<string, Signal<SortedSet<Tuple>>>(
            [...rulesGroupedByPredicateSymbol.keys()].map(
                predicateSymbol => [predicateSymbol, new Signal((resultMinus1: Map<string, SortedSet<Tuple>>) => resultMinus1.get(predicateSymbol))]))
        resultTMinus1Signals.forEach(signal => signalAdjacencyList.set(signal, [resultTMinus1Signal]));
        const inputSignals = new ArrayKeyedMap<Fact | Idb, Signal<Iterable<Tuple>>>();
        const inputAtoms: (Fact | Idb)[] = [];

        const predecessors: Signal<[string, SortedSet<Tuple>]>[] = [];

        for(const [predicateSymbol, rules] of rulesGroupedByPredicateSymbol)
        {
            const disjunction = new Signal(
                (resultTMinus1: SortedSet<Tuple>, ...conjunctions: Iterable<Tuple>[]): [string, SortedSet<Tuple>] =>
                {
                    const resultT = new SortedSet(resultTMinus1);
                    for(const conjunction of conjunctions)
                        for(const tuple of conjunction)
                            resultT.add(tuple);

                    return [predicateSymbol, resultT];

                });

            predecessors.push(disjunction);
            const disjunctionPredecessors: Signal<Iterable<Tuple>>[] = [];

            for(const rule of rules)
            {
                const conjunction = new Signal(Conjunction(
                    rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                    rule[1]));
                disjunctionPredecessors.push(conjunction);
                const conjunctionPredecessors: Signal<Iterable<Tuple>>[] = [];
                signalAdjacencyList.set(
                    conjunction,
                    conjunctionPredecessors)

                for(const atom of rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'))
                    if(IsIdb(atom) && resultTMinus1Signals.has(atom[0]))
                        conjunctionPredecessors.push(resultTMinus1Signals.get(atom[0]));

                    else
                    {
                        let inputSignal = inputSignals.get(atom);
                        if(!inputSignal)
                        {
                            inputSignal = new Signal();
                            signalAdjacencyList.set(
                                inputSignal,
                                []);

                            inputSignals.set(
                                atom,
                                inputSignal);
                            inputAtoms.push(atom);
                        }
                        conjunctionPredecessors.push(inputSignal);
                    }
            }

            signalAdjacencyList.set(
                disjunction,
                [resultTMinus1Signals.get(predicateSymbol), ...disjunctionPredecessors]);
        }

        let resultT: Map<string, SortedSet<Tuple>>;
        signalAdjacencyList.set(
            new Signal((...t: [string, SortedSet<Tuple>][]) => resultT = new Map(t)),
            predecessors);

        const scheduler: IScheduler = new Scheduler(signalAdjacencyList);
        return [(...inputs: Iterable<Tuple>[]): Map<string, SortedSet<Tuple>> =>
        {
            let resultTMinus1: Map<string, SortedSet<Tuple>> = resultT0;
            scheduler.Update(
                scheduler =>
                {
                    inputAtoms.forEach((atom, index) => scheduler.Inject(
                        inputSignals.get(atom),
                        inputs[index]));
                    scheduler.Inject(
                        resultTMinus1Signal,
                        resultTMinus1);
                });

            while([...resultT].some(([predicateSymbol, result]) => result.size !== resultTMinus1.get(predicateSymbol).size))
            {
                resultTMinus1 = resultT;
                scheduler.Update(
                    scheduler => scheduler.Inject(
                        resultTMinus1Signal,
                        resultTMinus1));
            }

            return resultT;
        }, inputAtoms];
    }
}
