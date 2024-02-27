import { Group } from "../Collections/Group";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { LongestPaths } from "../Graph/AdjacencyList";
import { Condense } from "../Graph/StronglyConnectedComponents";
import { Wrapped, WrapperType } from "../Ontology/Wrapped";
import { Conjunction, Disjunction, Recursion } from "./Datalog";
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { Atom, Fact, Idb, IsIdb, Rule } from "./IEavStore";
import { Tuple } from "./Tuple";

export abstract class DatalogInterpreter<T extends WrapperType> implements IDatalogInterpreter<T>
{
    private readonly _disjunction: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>;

    constructor(
        private readonly _tupleCompare: Compare<Tuple>
        )
    {
        this._disjunction = Disjunction(_tupleCompare);
    }

    Query<THead extends Tuple>(
        head: [...THead],
        body: Atom[],
        ...rules: Rule[]): Wrapped<T, {[K in keyof THead]: any;}[]>
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

        type SCC<T> = ReadonlyArray<T> & { LongestPath?: number; } & { Recursive?: boolean; };

        // Condense the rule graph.
        let condensed: ReadonlyMap<SCC<string>, ReadonlyArray<SCC<string>>> = Condense(rulePredecessors);

        // Determine longest path for each strongly connected component in the condensed graph.
        const longestPaths = LongestPaths(condensed);

        for(const [stronglyConnectComponent, longestPath] of longestPaths)
            stronglyConnectComponent.LongestPath = longestPath;

        for(const scc of condensed.keys())
            scc.Recursive = scc.length > 1 || rulePredecessors.get(scc[0]).includes(scc[0]);

        const sorted = [...condensed.keys()].sort((a, b) => a.LongestPath - b.LongestPath);

        const wrappedIdbs = new Map<string, Wrapped<T, Iterable<Tuple>>>();

        for(const stronglyConnectedComponent of sorted)
        {
            if(stronglyConnectedComponent.Recursive)
            {
                let recursion: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[];
                let predecessorAtoms: (Fact | Idb)[];
                [recursion, predecessorAtoms]
                    = Recursion(
                        this._tupleCompare,
                        stronglyConnectedComponent.map(predicateSymbol => [predicateSymbol, rulesGroupedByPredicateSymbol.get(predicateSymbol)]));
                const wrappedPredecessors: Wrapped<T, Iterable<Tuple>>[] = predecessorAtoms.map(
                    atom => IsIdb(atom) ? wrappedIdbs.get(atom[0]) : this.WrapEdb(atom));

                let wrappedRecursion = this.Wrap(
                    recursion,
                    ...wrappedPredecessors);

                stronglyConnectedComponent
                    .forEach((predicateSymbol, index) => wrappedIdbs.set(
                        predicateSymbol,
                        this.Wrap(
                            (recursionOutput: SortedSet<Tuple>[]) => <Tuple[]>recursionOutput[index].Array,
                            wrappedRecursion)));
            }
            else
            {
                const predicateSymbol = stronglyConnectedComponent[0];
                const rules = rulesGroupedByPredicateSymbol.get(predicateSymbol);
                if(rules.length === 1)
                {
                    const rule = rules[0];
                    const conjunction = Conjunction(
                        rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                        rule[1]);
                    const wrappedPredecessors: Wrapped<T, Iterable<Tuple>>[] = rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function').map(
                        atom => IsIdb(atom) ? wrappedIdbs.get(atom[0]) : this.WrapEdb(atom));

                    const wrappedConjunction = this.Wrap(
                        conjunction,
                        ...wrappedPredecessors);
                    wrappedIdbs.set(
                        predicateSymbol,
                        wrappedConjunction);
                }
                else // Disjunction of conjunctions.
                {
                    const wrappedPredecessors: Wrapped<T, Iterable<Tuple>>[] = rules.map(
                        rule =>
                        {
                            const conjunction = Conjunction(
                                rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                                rule[1]);
                            const wrappedPredecessors: Wrapped<T, Iterable<Tuple>>[] = rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function').map(
                                atom => IsIdb(atom) ? wrappedIdbs.get(atom[0]) : this.WrapEdb(atom));

                            const wrappedConjunction = this.Wrap(
                                conjunction,
                                ...wrappedPredecessors);
                            return wrappedConjunction;
                        });

                    const wrappedDisjunction = this.Wrap(
                        this._disjunction,
                        ...wrappedPredecessors);
                    wrappedIdbs.set(
                        predicateSymbol,
                        wrappedDisjunction);
                }
            }
        }

        return <Wrapped<T, {[K in keyof THead]: any;}[]>>wrappedIdbs.get('');
    }

    abstract Wrap<TIn extends any[], TOut>(
        map: (...params: TIn) => TOut,
        ...params: {[Parameter in keyof TIn]: Wrapped<T, TIn[Parameter]>;}): Wrapped<T, TOut>

    abstract WrapEdb(atom: Fact): Wrapped<T, Iterable<Fact>>
}
