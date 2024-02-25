import { ArrayKeyedMap } from "../Collections/ArrayKeyedMap";
import { Group } from "../Collections/Group";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { Transpose } from "../Graph/AdjacencyList";
import { StronglyConnectedComponents } from "../Graph/StronglyConnectedComponents";
import { WrapperType } from "../Ontology/Wrapped";
import { Signal } from "../Signal/Signal";
import { Wrap, Wrapped } from "../Wrap";
import { Conjunction, Disjunction } from "./Datalog";
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { Atom, Fact, Idb, IEavStore, IsIdb, Rule } from "./IEavStore";
import { Tuple } from "./Tuple";

export class DatalogSignalInterpreter implements IDatalogInterpreter<WrapperType.Signal>
{
    private _disjunction: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>;

    constructor(
        private _eavStore    : IEavStore,
        private _tupleCompare: Compare<Tuple>
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
                let recursion: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[];
                let predecessorAtoms: (Fact | Idb)[];
                [recursion, predecessorAtoms]
                    = this.Recursion(stronglyConnectedComponent.map(predicateSymbol => [predicateSymbol, rulesGroupedByPredicateSymbol.get(predicateSymbol)]));
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

    private Recursion(
        rulesGroupedByPredicateSymbol: [string, Rule[]][]
        ): [(...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[], (Fact | Idb)[]]
    {
        type Result = SortedSet<Tuple>[];
        const empty = new SortedSet(this._tupleCompare);
        const resultT0: Result = rulesGroupedByPredicateSymbol.map(() => empty);
        let resultTMinus1: Result;
        let inputs: Iterable<Tuple>[];

        const wrappedDisjunctions: Wrapped<SortedSet<Tuple>>[] = [];
        const wrappedInputs = new ArrayKeyedMap<Fact | Idb, Wrapped<Iterable<Tuple>>>();
        const inputAtoms: (Fact | Idb)[] = [];

        rulesGroupedByPredicateSymbol.forEach(
            ([predicateSymbol, rules], index) =>
            {
                const disjunction = (...params: [SortedSet<Tuple>, ...Iterable<Tuple>[]]): SortedSet<Tuple> =>
                {
                    const [resultTMinus1, ...conjunctions] = params;
                    const resultT = new SortedSet(resultTMinus1);
                    for(const conjunction of conjunctions)
                        for(const tuple of conjunction)
                            resultT.add(tuple);

                    return resultT;
                };

                const wrappedDisjunctionPredecessors: [() => SortedSet<Tuple>, ...Wrapped<Iterable<Tuple>>[]] = [() => resultTMinus1[index] || new SortedSet(this._tupleCompare)];

                for(const rule of rules)
                {
                    const conjunction = Conjunction(
                        rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                        rule[1]);
                    const wrappedConjunctionPredecessors: Wrapped<Iterable<Tuple>>[] = [];

                    for(const atom of rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'))
                    {
                        let wrappedInput: Wrapped<Iterable<Tuple>>;
                        const resultTMinus1Index = IsIdb(atom) ? rulesGroupedByPredicateSymbol.findIndex(element => element[0] === atom[0]) : -1;
                        if(resultTMinus1Index !== -1)
                            wrappedInput = () => resultTMinus1[resultTMinus1Index];

                        else
                        {
                            wrappedInput = wrappedInputs.get(atom);
                            if(!wrappedInput)
                            {
                                const inputIndex = inputAtoms.push(atom) - 1;
                                wrappedInput = () => inputs[inputIndex];
                                wrappedInputs.set(
                                    atom,
                                    wrappedInput);
                            }
                        }

                        wrappedConjunctionPredecessors.push(wrappedInput);
                    }

                    const wrappedConjunction = Wrap(conjunction, ...wrappedConjunctionPredecessors);
                    wrappedDisjunctionPredecessors.push(wrappedConjunction);
                }

                const wrappedDisjunction = Wrap(disjunction, ...wrappedDisjunctionPredecessors);
                wrappedDisjunctions.push(wrappedDisjunction);
            });

        const wrapped = Wrap(
            (...wrappedDisjunctions: SortedSet<Tuple>[]) => wrappedDisjunctions,
            ...wrappedDisjunctions);


        return [(...params: Iterable<Tuple>[]): SortedSet<Tuple>[] =>
        {
            inputs = params;
            resultTMinus1 = resultT0;
            let resultT = wrapped();

            while([...resultT].some((result, index) => result.size !== resultTMinus1[index].size))
            {
                resultTMinus1 = resultT;
                resultT = wrapped();
            }

            return resultT;
        }, inputAtoms];
    }
}
