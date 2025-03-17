import { Group } from "../Collections/Group";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { StronglyConnectedComponents } from "../Graph/StronglyConnectedComponents";
import { Wrapped, WrapperType } from "../Ontology/Wrapped";
import { Atom, Conjunction, Disjunction, Idb, IsIdb, PredecessorAtoms, RecursiveDisjunction, Rule } from "./Datalog";
import { IDatalogInterpreter } from "./IDatalogInterpreter";
import { Fact, IEavStore } from "./IEavStore";
import { Tuple } from "./Tuple";

export abstract class DatalogInterpreter<T extends WrapperType> implements IDatalogInterpreter<T>
{
    private readonly _conjunction         : (head: Tuple, body: Atom[]) => (...inputs: Iterable<Tuple>[]) => Iterable<Tuple>;
    private readonly _disjunction         : (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>;
    private readonly _recursiveDisjunction: (rules: Rule[]) => [(...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>, (Fact | Idb)[]];

    constructor(
        private readonly _eavStore: IEavStore,
        tupleCompare              : Compare<Tuple>
        )
    {
        this._conjunction          = Conjunction(tupleCompare);
        this._disjunction          = Disjunction(tupleCompare);
        this._recursiveDisjunction = RecursiveDisjunction(tupleCompare);
    }

    Query<THead extends Tuple>(
        head: [...THead],
        body: Atom[],
        ...rules: Rule[]
        ): Wrapped<T, {[K in keyof THead]: any;}[]>
    {
        return <Wrapped<T, {[K in keyof THead]: any;}[]>>this.Rules([[['', ...head], body], ...rules]).get('');
    }

    Rules(
        rules: Rule[]
        ): Map<string, Wrapped<T, Iterable<Tuple>>>
    {
        const rulesGroupedByPredicateSymbol = Group(
            rules,
            rule => rule[0][0],
            rule => rule);

        const rulePredecessors = new Map(
            rules.map<[string, string[]]>(
                rule => [
                    rule[0][0],
                    [].concat(...rulesGroupedByPredicateSymbol.get(rule[0][0]).map(rule => PredecessorAtoms(rule[1]).filter(IsIdb).map(idb => idb[0])))]));

        type SCC<T> = ReadonlyArray<T> & { Recursive?: boolean; };
        const stronglyConnectedComponents = new Map<string, SCC<string>>([].concat(
            ...StronglyConnectedComponents(rulePredecessors).map(scc => scc.map(predicateSymbol => <[string, SCC<string>]>[predicateSymbol, scc]))));

        stronglyConnectedComponents.forEach(scc => scc.Recursive = scc.length > 1 || rulePredecessors.get(scc[0]).includes(scc[0]));

        const wrappedAdjacencyList = new Map<Wrapped<T, Iterable<Tuple>>, Wrapped<T, Iterable<Tuple>>[]>();
        const wrappedIdbs = new Map<string, Wrapped<T, Iterable<Tuple>>>();
        const wrappedPredecessorAtoms = new Map<Wrapped<T, Iterable<Tuple>>, (Fact | Idb)[]>();

        for(const [predicateSymbol, rules] of rulesGroupedByPredicateSymbol)
        {
            if(stronglyConnectedComponents.get(predicateSymbol).Recursive)
            {
                let recursiveDisjunction: (...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>;
                let predecessorAtoms: (Fact | Idb)[];
                [recursiveDisjunction, predecessorAtoms] = this._recursiveDisjunction(rules);
                const wrappedRecursiveDisjunction = this.Wrap(recursiveDisjunction);
                wrappedAdjacencyList.set(
                    wrappedRecursiveDisjunction,
                    []);
                wrappedPredecessorAtoms.set(
                    wrappedRecursiveDisjunction,
                    predecessorAtoms);
                wrappedIdbs.set(
                    predicateSymbol,
                    wrappedRecursiveDisjunction);
            }
            else
            {
                if(rules.length === 1)
                {
                    const [head, body] = rules[0];
                    const [predicateSymbol,] = head;
                    const wrappedConjunction = this.Wrap(this._conjunction(
                        predicateSymbol === '' ? head.slice(1) : head,
                        body));
                    wrappedAdjacencyList.set(
                        wrappedConjunction,
                        []);
                    wrappedPredecessorAtoms.set(
                        wrappedConjunction,
                        PredecessorAtoms(body));
                    wrappedIdbs.set(
                        predicateSymbol,
                        wrappedConjunction);
                }
                else // Disjunction of conjunctions.
                {
                    const wrappedDisjunction = this.Wrap(this._disjunction);
                    const predecessors: Wrapped<T, Iterable<Tuple>>[] = [];
                    wrappedAdjacencyList.set(
                        wrappedDisjunction,
                        predecessors);
                    wrappedIdbs.set(
                        predicateSymbol,
                        wrappedDisjunction);

                    for(const [head, body] of rules)
                    {
                        const [predicateSymbol,] = head;
                        const wrappedConjunction = this.Wrap(this._conjunction(
                            predicateSymbol === '' ? head.slice(1) : head,
                            body));
                        predecessors.push(wrappedConjunction);
                        wrappedAdjacencyList.set(
                            wrappedConjunction,
                            []);
                        wrappedPredecessorAtoms.set(
                            wrappedConjunction,
                            PredecessorAtoms(body));
                    }
                }
            }
        }

        for(const [wrapped, predecessorAtoms] of wrappedPredecessorAtoms)
        {
            const predecessors = wrappedAdjacencyList.get(wrapped);
            for(const atom of predecessorAtoms)
                if(IsIdb(atom))
                    predecessors.push(wrappedIdbs.get(atom[0]));

                else
                    predecessors.push(this.WrapEdb(atom));
        }

        return wrappedIdbs;
    }

    abstract Wrap<T>(map: (...inputs: Iterable<Tuple>[]) => Iterable<Tuple>): Wrapped<T, Iterable<Tuple>>

    abstract WrapEdb(atom: Fact): Wrapped<T, Iterable<Fact>>
}
