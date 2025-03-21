import { ArrayKeyedMap } from "../Collections/ArrayKeyedMap";
import { Group } from "../Collections/Group";
import { SortedMap } from "../Collections/SortedMap";
import { SortedSet } from "../Collections/SortedSet";
import { LongestPaths } from "../Graph/AdjacencyList";
import { Condense } from "../Graph/StronglyConnectedComponents";
import { Aggregation } from "./Aggregation";
import { Atom, IsConstant, IsEdb, IsIdb, IsVariable, PredecessorAtoms, Rule } from "./Datalog";
import { Not } from "./DatalogNot";
import { tupleCompare } from "./EavStore";
import { IEavStore } from "./IEavStore";
import { Tuple } from "./Tuple";

type SCC<T> = ReadonlyArray<T> & {LongestPath?: number;} & {Recursive?: boolean;};

export function Query<T extends Tuple>(
    store: IEavStore,
    head: [...T],
    body: Atom[],
    ...rules: Rule[]): {[K in keyof T]: any;}[]
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
                [].concat(...rulesGroupedByPredicateSymbol.get(rule[0][0]).map(rule => PredecessorAtoms(rule[1]).filter(IsIdb).map(idb => idb[0])))]));

    // Condense the rule graph.
    let condensed: ReadonlyMap<SCC<string>, ReadonlyArray<SCC<string>>> = Condense(rulePredecessors);

    // Determine longest path for each strongly connected component in the condensed graph.
    const longestPaths = LongestPaths(condensed);

    for(const [stronglyConnectComponent, longestPath] of longestPaths)
        stronglyConnectComponent.LongestPath = longestPath;

    for(const scc of condensed.keys())
        scc.Recursive = scc.length > 1 || rulePredecessors.get(scc[0]).includes(scc[0]);

    const sorted = [...condensed.keys()].sort((a, b) => a.LongestPath - b.LongestPath);

    const edbValues = new ArrayKeyedMap(rules.map(rule => PredecessorAtoms(rule[1]).filter(IsEdb).map(edb => <[any[], Iterable<Tuple>]>[edb, store.Query(edb)])).flat());
    const idbValues = new Map<string, Iterable<Tuple>>();

    for(const stronglyConnectedComponent of sorted)
        StronglyConnectedComponent(
            rulesGroupedByPredicateSymbol,
            stronglyConnectedComponent,
            edbValues,
            idbValues);

    return <any[]>idbValues.get('');
}

function StronglyConnectedComponent(
    rulesGroupedByPredicateSymbol: ReadonlyMap<string, Rule[]>,
    stronglyConnectedComponent: SCC<string>,
    edbValues: Map<any[], Iterable<Tuple>>,
    idbValues: Map<string, Iterable<Tuple>>
    ): void
{
    if(stronglyConnectedComponent.Recursive)
        Recursion(
            rulesGroupedByPredicateSymbol,
            stronglyConnectedComponent,
            edbValues,
            idbValues);
    else
    {
        const predicateSymbol = stronglyConnectedComponent[0];
        const rules = rulesGroupedByPredicateSymbol.get(predicateSymbol);
        if(rules.length === 1)
            Conjunction(
                rules[0],
                edbValues,
                idbValues,
                idbValues);

        else
            Disjunction(
                rules,
                edbValues,
                idbValues,
                idbValues);
    }
}

function Recursion(
    rulesGroupedByPredicateSymbol: ReadonlyMap<string, Rule[]>,
    stronglyConnectedComponent: SCC<string>,
    edbValues: Map<any[], Iterable<Tuple>>,
    idbValues: Map<string, Iterable<Tuple>>
    ): void
{
    const empty = new SortedSet(tupleCompare);
    const nextIdbValues = new Map<string, any>();

    stronglyConnectedComponent.forEach(
        predicateSymbol => idbValues.set(
            predicateSymbol,
            empty));
    stronglyConnectedComponent.forEach(
        predicateSymbol => Disjunction(
            rulesGroupedByPredicateSymbol.get(predicateSymbol),
            edbValues,
            idbValues,
            nextIdbValues));

    while(stronglyConnectedComponent.some(predicateSymbol => idbValues.get(predicateSymbol) !== nextIdbValues.get(predicateSymbol)))
    {
        stronglyConnectedComponent.forEach(
            predicateSymbol => idbValues.set(
                predicateSymbol,
                nextIdbValues.get(predicateSymbol)));

        stronglyConnectedComponent.forEach(
            predicateSymbol => Disjunction(
                rulesGroupedByPredicateSymbol.get(predicateSymbol),
                edbValues,
                idbValues,
                nextIdbValues));
    }
}

function Conjunction(
    rule: Rule,
    edbValues: Map<any[], Iterable<Tuple>>,
    idbValues: ReadonlyMap<string, Iterable<Tuple>>,
    nextIdbValues: Map<string, Iterable<Tuple>>
    ): void
{
    const [, body] = rule;
    let head = [...rule[0]];
    const predicateSymbol = head[0];
    head = predicateSymbol === '' ? head.slice(1) : head;

    let substitutions = RecursiveConjunction(
        body,
        edbValues,
        idbValues);

    if(head.some(term => term instanceof Aggregation))
    {
        const keyVariables = head.filter(IsVariable);
        const grouped = substitutions.reduce<Map<Tuple, object[]>>(
            (grouped, substitution) =>
            {
                const key = keyVariables.map(term => substitution[term]);
                let group = grouped.get(key);
                if(group)
                    group.push(substitution);

                else
                    grouped.set(
                        key,
                        [substitution])

                return grouped;

            },
            new SortedMap<Tuple, object[]>(tupleCompare));

        nextIdbValues.set(
            predicateSymbol,
            [...grouped.entries()].map(
                entry => head.map(
                    term => term instanceof Aggregation ? term.Aggregate(entry[1]) : IsVariable(term) ? entry[0][keyVariables.indexOf(term)] : term)));
    }
    else
        nextIdbValues.set(
            predicateSymbol,
            substitutions.map(substitution => head.map(term => IsVariable(term) ? substitution[term] : term)));
}

function RecursiveConjunction(
    body: Atom[],
    edbValues: Map<any[], Iterable<Tuple>>,
    idbValues: ReadonlyMap<string, Iterable<Tuple>>
    ): object[]
{
    const substitutions = body.reduce(
        (substitutions, atom) =>
        {
            if(typeof atom === 'function')
                return [...atom(substitutions)];

            if(atom instanceof Not)
            {
                let input = RecursiveConjunction(
                    atom.Atoms,
                    edbValues,
                    idbValues);

                let count = substitutions.length;
                while(count--)
                {
                    const outer = substitutions.shift();
                    let match = false;
                    for(const inner of input)
                    {
                        match = true;
                        for(const variable in inner)
                            if(!(outer[variable] === undefined || outer[variable] === inner[variable]))
                            {
                                match = false;
                                break;
                            }

                        if(match)
                            break;
                    }

                    if(!match)
                        substitutions.push(outer);
                }
            }
            else
            {
                let count = substitutions.length;
                const input = IsIdb(atom) ? idbValues.get(atom[0]) : edbValues.get(atom);
                while(count--)
                {
                    const substitution = substitutions.shift();
                    for(const tuple of input)
                    {
                        let merged = {...substitution};
                        for(let index = 0; index < atom.length && merged; ++index)
                        {
                            const term = atom[index];
                            if(IsConstant(term))
                            {
                                if(term !== tuple[index])
                                    merged = null;
                            }
                            else if(IsVariable(term))
                            {
                                if(typeof merged[term] === 'undefined')
                                    merged[term] = tuple[index];

                                else if(merged[term] !== tuple[index])
                                    // Fact does not match query pattern.
                                    merged = null;
                            }
                        }

                        if(merged)
                            substitutions.push(merged);
                    }
                }
            }

            return substitutions;
        },
        [{}]);
    return substitutions;
}

function Disjunction(
    rules: Rule[],
    edbValues: Map<any[], Iterable<Tuple>>,
    idbValues: ReadonlyMap<string, Iterable<Tuple>>,
    nextIdbValues: Map<string, Iterable<Tuple>>
    ): void
{
    const predicateSymbol = rules[0][0][0];
    const result = <SortedSet<Tuple>>idbValues.get(predicateSymbol);
    const nextResult = new SortedSet<Tuple>(
        tupleCompare,
        result);
    for(const rule of rules)
    {
        Conjunction(
            rule,
            edbValues,
            idbValues,
            nextIdbValues);
        for(const tuple of nextIdbValues.get(predicateSymbol))
            nextResult.add(tuple);
    }

    nextIdbValues.set(
        predicateSymbol,
        result && result.size === nextResult.size ? result : nextResult);
}
