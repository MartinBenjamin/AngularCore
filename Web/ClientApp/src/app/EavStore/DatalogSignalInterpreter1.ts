import { Group } from "../Collections/Group";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { StronglyConnectedComponents } from "../Graph/StronglyConnectedComponents";
import { WrapperType } from "../Ontology/Wrapped";
import { Signal } from "../Signal/Signal";
import { Atom, Conjunction, Disjunction, Idb, IsIdb, RecursiveDisjunction, Rule, _Not } from "./Datalog";
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { Fact, IEavStore } from "./IEavStore";
import { Tuple } from "./Tuple";

export class DatalogSignalInterpreter implements IDatalogInterpreter<WrapperType.Signal>
{
    private readonly _conjunction         : (head: Tuple, body: Atom[]) => (...inputs: Iterable<Tuple>[]) => Iterable<Tuple>;
    private readonly _disjunction         : (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>;
    private readonly _recursiveDisjunction: (rules: Rule[]) => [(...inputs: [SortedSet<Tuple>, ...Iterable<Tuple>[]]) => SortedSet<Tuple>, (Fact | Idb)[]];

    constructor(
        private readonly _eavStore: IEavStore,
        tupleCompare              : Compare<Tuple>
        )
    {
        this._conjunction          = Conjunction(tupleCompare);
        this._disjunction          = Disjunction(tupleCompare);
        this._recursiveDisjunction = RecursiveDisjunction(tupleCompare);
    }

    Query<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]
        ): Signal<{[K in keyof T]: any;}[]>
    {
        return <Signal>this.Rules([[['', ...head], body], ...rules]).get('');
    }

    Rules(
        rules: Rule[]
        ): Map<string, Signal<Iterable<Tuple>>>
    {
        const rulesGroupedByPredicateSymbol = Group(
            rules,
            rule => rule[0][0],
            rule => rule);

        const rulePredecessors = new Map(
            rules.map<[string, string[]]>(
                rule => [
                    rule[0][0],
                    [].concat(...rulesGroupedByPredicateSymbol.get(rule[0][0]).map(rule => rule[1].filter(IsIdb).map(idb => idb[0])))]));

        type SCC<T> = ReadonlyArray<T> & { Recursive?: boolean; };
        const stronglyConnectedComponents = new Map<string, SCC<string>>([].concat(
            ...StronglyConnectedComponents(rulePredecessors).map(scc => scc.map(predicateSymbol => <[string, SCC<string>]>[predicateSymbol, scc]))));

        stronglyConnectedComponents.forEach(scc => scc.Recursive = scc.length > 1 || rulePredecessors.get(scc[0]).includes(scc[0]));

        const signalAdjacencyList = new Map<Signal, Signal[]>();
        const idbSignals = new Map<string, Signal<Iterable<Tuple>>>();
        const signalPredecessorAtoms = new Map<Signal, (Fact | Idb)[]>();

        for(const [predicateSymbol, rules] of rulesGroupedByPredicateSymbol)
        {
            if(stronglyConnectedComponents.get(predicateSymbol).Recursive)
            {
                let recursiveDisjunction: (...inputs: [SortedSet<Tuple>, ...Iterable<Tuple>[]]) => SortedSet<Tuple>;
                let predecessorAtoms: (Fact | Idb)[];
                [recursiveDisjunction, predecessorAtoms] = this._recursiveDisjunction(rules);
                const recursiveSignal = new Signal(
                    recursiveDisjunction,
                    (lhs, rhs) => lhs && rhs && lhs.size === rhs.size);
                signalAdjacencyList.set(
                    recursiveSignal,
                    [recursiveSignal]);
                signalPredecessorAtoms.set(
                    recursiveSignal,
                    predecessorAtoms);
                idbSignals.set(
                    predicateSymbol,
                    recursiveSignal);
            }
            else
            {
                if(rules.length === 1)
                {
                    const rule = rules[0];
                    const conjunction = new Signal(this._conjunction(
                        rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                        rule[1]));
                    signalAdjacencyList.set(
                        conjunction,
                        []);
                    signalPredecessorAtoms.set(
                        conjunction,
                        this.PredecessorAtoms(rule[1]));
                    idbSignals.set(
                        predicateSymbol,
                        conjunction);
                }
                else // Disjunction of conjunctions.
                {
                    const disjunction = new Signal(this._disjunction);
                    const predecessors: Signal[] = [];
                    signalAdjacencyList.set(
                        disjunction,
                        predecessors);
                    idbSignals.set(
                        predicateSymbol,
                        disjunction);

                    for(const rule of rules)
                    {
                        const conjunction = new Signal(this._conjunction(
                            rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                            rule[1]));
                        predecessors.push(conjunction);
                        signalAdjacencyList.set(
                            conjunction,
                            []);
                        signalPredecessorAtoms.set(
                            conjunction,
                            this.PredecessorAtoms(rule[1]));
                    }
                }
            }
        }

        for(const [signal, predecessorAtoms] of signalPredecessorAtoms)
        {
            const predecessors: Signal[] = signalAdjacencyList.get(signal);
            for(const atom of predecessorAtoms)
                if(IsIdb(atom))
                    predecessors.push(idbSignals.get(atom[0]));

                else
                    predecessors.push(this._eavStore.Signal(atom));
        }

        this._eavStore.SignalScheduler.AddSignals(signalAdjacencyList);
        return idbSignals;
    }

    private PredecessorAtoms(
        atoms: Atom[]
        ): (Fact | Idb)[]
    {
        return atoms
            .filter((atom): atom is Fact | Idb => typeof atom !== 'function')
            .reduce<(Fact | Idb)[]>(
                (predecessors, atom) =>
                {
                    if(atom instanceof _Not)
                        predecessors.push(...this.PredecessorAtoms(atom.Atoms));

                    else
                        predecessors.push(atom);

                    return predecessors;
                },
                []);
    }
}
