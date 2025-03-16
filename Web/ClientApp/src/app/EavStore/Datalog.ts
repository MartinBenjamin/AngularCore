import { ArrayKeyedMap } from "../Collections/ArrayKeyedMap";
import { SortedMap } from "../Collections/SortedMap";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { Wrap, Wrapped } from "../Wrap";
import { Aggregation } from "./Aggregation";
import { BuiltIn } from "./BuiltIn";
import { Not } from "./DatalogNot";
import { Fact } from "./Fact";
import { Tuple } from "./Tuple";

export type Variable = `?${string}`;
export const IsVariable = (term): term is Variable => typeof term === 'string' && term[0] === '?';
export const IsConstant = term => !(typeof term === 'undefined' || IsVariable(term));
export const IsPredicateSymbol = (term): term is string => typeof term === 'string' && term[0] !== '?';
export type Edb = Fact;
export type Idb = [string, ...any[]];
export type Atom = Idb | Edb | BuiltIn | Not;
export type Rule = [Head: Idb, Body: Atom[]];
export const IsIdb = (atom): atom is Idb => atom instanceof Array && IsPredicateSymbol(atom[0]);
export const IsEdb = (atom): atom is Edb => atom instanceof Array && !IsPredicateSymbol(atom[0]);

const _Not = (...atoms: Atom[]) => new Not(atoms);

export { _Not as Not };

export function Conjunction(
    tupleCompare: Compare<Tuple>
    ): (head: Tuple, body: Atom[]) => (...inputs: Iterable<Tuple>[]) => Iterable<Tuple>
{
    return (head: Tuple, body: Atom[]): (...inputs: Iterable<Tuple>[]) => Iterable<Tuple> =>
    {
        return (...inputs: Iterable<Tuple>[]): Iterable<Tuple> =>
        {
            let substitutions: object[];
            [substitutions,] = RecursiveConjunction(
                body,
                ...inputs);

            if(head.some(term => term instanceof Aggregation))
            {
                const grouped = substitutions.reduce<Map<Tuple, object[]>>(
                    (grouped, substitution) =>
                    {
                        const key = head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term);
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

                return [...grouped.keys()].map(key => key.map(element => element instanceof Aggregation ? element.Aggregate(grouped.get(key)) : element));

            }

            return substitutions.map(substitution => head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
        }
    }
}

let RecursiveConjunction: (body: Atom[], ...inputs: Iterable<Tuple>[])=> [object[], number];

RecursiveConjunction = (body: Atom[], ...inputs: Iterable<Tuple>[]): [object[], number] =>
{
    let inputIndex = 0;
    const substitutions = body.reduce(
        (substitutions, atom) =>
        {
            if(typeof atom === 'function')
                return [...atom(substitutions)];

            if(atom instanceof Not)
            {
                let input: Iterable<object>;
                [input, inputIndex] = RecursiveConjunction(
                    atom.Atoms,
                    ...inputs.slice(inputIndex));

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
                const input = inputs[inputIndex++];
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
    return [substitutions, inputIndex];
}

export function Disjunction<T extends Tuple>(
    tupleCompare: Compare<T>
    ): (...inputs: Iterable<T>[]) => SortedSet<T>
{
    return (first: Iterable<T>, ...rest: Iterable<T>[]): SortedSet<T> =>
        rest.reduce<SortedSet<T>>(
            (accumulator, input)=>
            {
                for(const tuple of input)
                    accumulator.add(tuple);
                return accumulator;
            },
            new SortedSet<T>(
                tupleCompare,
                first));
}

export function Accumulate<T extends Tuple>(
    tupleCompare: Compare<T>
    ): (previousResult: SortedSet<T>, input: Iterable<T>) => SortedSet<T>
{
    const empty = new SortedSet(tupleCompare);
    return (previousResult: SortedSet<T>, input: Iterable<T>): SortedSet<T> =>
    {
        previousResult = previousResult || empty;
        const result = new SortedSet(
            tupleCompare,
            previousResult);
        for(const tuple of input)
            result.add(tuple);
        // If no change, return previousResult to enable detection of fixed point by referential equality.
        return previousResult && previousResult.size === result.size ? previousResult : result;
    }
}

export function RecursiveDisjunction(
    tupleCompare: Compare<Tuple>
    ): (rules: Rule[]) => [(...inputs: [SortedSet<Tuple>, ...Iterable<Tuple>[]]) => SortedSet<Tuple>, (Fact | Idb)[]]
{
    const empty = new SortedSet(tupleCompare);
    const disjunction = Disjunction(tupleCompare);
    return (rules: Rule[]): [(...inputs: [SortedSet<Tuple>, ...Iterable<Tuple>[]]) => SortedSet<Tuple>, (Fact | Idb)[]] =>
    {
        type InputType = [SortedSet<Tuple>, ...Iterable<Tuple>[]];
        const wrappedInputs = new ArrayKeyedMap<Fact | Idb, Wrapped<Iterable<Tuple>>>();
        const inputAtoms: (Fact | Idb)[] = [];
        let inputs: InputType;

        const wrappedDisjunctionPredecessors: [Wrapped<SortedSet<Tuple>>, ...Wrapped<Iterable<Tuple>>[]] = [() => inputs[0] || empty];

        for(const [head, body] of rules)
        {
            const [predicateSymbol,] = head;
            const conjunction = Conjunction(tupleCompare)(
                predicateSymbol === '' ? head.slice(1) : head,
                body);
            const wrappedConjunctionPredecessors: Wrapped<Iterable<Tuple>>[] = [];

            for(const atom of PredecessorAtoms(body))
            {
                let wrappedInput: Wrapped<Iterable<Tuple>>;
                if(IsIdb(atom) && atom[0] === head[0])
                    wrappedInput = wrappedDisjunctionPredecessors[0];

                else
                {
                    wrappedInput = wrappedInputs.get(atom);
                    if(!wrappedInput)
                    {
                        const inputIndex = inputAtoms.push(atom);
                        wrappedInput = () => inputs[inputIndex] || empty;
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
        const wrappedAccumulate = Wrap(
            Accumulate(tupleCompare),
            wrappedDisjunctionPredecessors[0],
            wrappedDisjunction);

        return [
            (...params: InputType): SortedSet<Tuple> =>
            {
                inputs = params;
                return wrappedAccumulate();
            },
            inputAtoms];
    };
}

export function Recursion(
    tupleCompare: Compare<Tuple>
    ): (rulesGroupedByPredicateSymbol: [string, Rule[]][]) => [(...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[], (Fact | Idb)[]]
{
    const empty = new SortedSet(tupleCompare);
    const disjunction = Disjunction(tupleCompare);
    const accumulate = Accumulate(tupleCompare);
    return (rulesGroupedByPredicateSymbol: [string, Rule[]][]): [(...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[], (Fact | Idb)[]] =>
    {
        type Result = SortedSet<Tuple>[];
        const resultT0: Result = rulesGroupedByPredicateSymbol.map(() => empty);
        let resultTMinus1: Result;
        let inputs: Iterable<Tuple>[];

        const wrappedDisjunctions: Wrapped<SortedSet<Tuple>>[] = [];
        const wrappedInputs = new ArrayKeyedMap<Fact | Idb, Wrapped<Iterable<Tuple>>>();
        const inputAtoms: (Fact | Idb)[] = [];

        rulesGroupedByPredicateSymbol.forEach(
            ([, rules], index) =>
            {
                const wrappedDisjunctionPredecessors: [Wrapped<SortedSet<Tuple>>, ...Wrapped<Iterable<Tuple>>[]] = [() => resultTMinus1[index]];

                for(const [head, body] of rules)
                {
                    const [predicateSymbol,] = head;
                    const conjunction = Conjunction(tupleCompare)(
                        predicateSymbol === '' ? head.slice(1) : head,
                        body);
                    const wrappedConjunctionPredecessors: Wrapped<Iterable<Tuple>>[] = [];

                    for(const atom of PredecessorAtoms(body))
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
                const wrappedAccumulate = Wrap(
                    accumulate,
                    wrappedDisjunctionPredecessors[0],
                    wrappedDisjunction);
                wrappedDisjunctions.push(wrappedAccumulate);
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
    };
}

export let PredecessorAtoms: (atoms: Atom[]) => (Fact | Idb)[];

PredecessorAtoms = (
    atoms: Atom[]
    ): (Fact | Idb)[] =>
{
    return atoms
        .filter((atom): atom is Fact | Idb => typeof atom !== 'function')
        .reduce<(Fact | Idb)[]>(
            (predecessors, atom) =>
            {
                if(atom instanceof Not)
                    predecessors.push(...PredecessorAtoms(atom.Atoms));

                else
                    predecessors.push(atom);

                return predecessors;
            },
            []);
};
