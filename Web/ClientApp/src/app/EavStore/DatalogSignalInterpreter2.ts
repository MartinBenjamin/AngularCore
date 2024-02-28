import { Group } from "../Collections/Group";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { Transpose } from "../Graph/AdjacencyList";
import { StronglyConnectedComponents } from "../Graph/StronglyConnectedComponents";
import { WrapperType } from "../Ontology/Wrapped";
import { Signal } from "../Signal/Signal";
import { Atom, Conjunction, Disjunction, Idb, IsIdb, Recursion, Rule } from "./Datalog";
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { Fact, IEavStore } from "./IEavStore";
import { Tuple } from "./Tuple";

export class DatalogSignalInterpreter implements IDatalogInterpreter<WrapperType.Signal>
{
    private readonly _disjunction: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>;
    private readonly _recursion  : (rulesGroupedByPredicateSymbol: [string, Rule[]][]) => [(...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[], (Fact | Idb)[]];

    constructor(
        private readonly _eavStore    : IEavStore,
        private readonly _tupleCompare: Compare<Tuple>
        )
    {
        this._disjunction = Disjunction(_tupleCompare);
        this._recursion   = Recursion(_tupleCompare);
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
                let recursion: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[];
                let predecessorAtoms: (Fact | Idb)[];
                [recursion, predecessorAtoms]
                    = this._recursion(stronglyConnectedComponent.map(predicateSymbol => [predicateSymbol, rulesGroupedByPredicateSymbol.get(predicateSymbol)]));
                const recursionSignal = new Signal(recursion);
                signalPredecessorAtoms.set(
                    recursionSignal,
                    predecessorAtoms);
                stronglyConnectedComponent
                    .forEach((predicateSymbol, index) =>
                    {
                        if(predicateSymbol === '' || ruleSuccessors.get(predicateSymbol).length)
                        {
                            const signal = new Signal((recursionOutput: SortedSet<Tuple>[]) => <Tuple[]>recursionOutput[index].Array);
                            signalAdjacencyList.set(
                                signal,
                                [recursionSignal])
                            idbSignals.set(
                                predicateSymbol,
                                signal);
                        }
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
}
