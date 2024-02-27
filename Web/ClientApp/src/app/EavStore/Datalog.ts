import { ArrayKeyedMap } from "../Collections/ArrayKeyedMap";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { Wrap, Wrapped } from "../Wrap";
import { BuiltIn } from "./BuiltIn";
import { Fact } from "./Fact";
import { Tuple } from "./Tuple";

export type Variable = `?${string}`;
export const IsVariable = (term): term is Variable => typeof term === 'string' && term[0] === '?';
export const IsConstant = term => !(typeof term === 'undefined' || IsVariable(term));

export const IsPredicateSymbol = (term): term is string => typeof term === 'string' && term[0] !== '?';
export type Edb = Fact | BuiltIn;
export type Idb = [string, ...any[]];
export const IsIdb = (atom): atom is Idb => atom instanceof Array && IsPredicateSymbol(atom[0]);

export type Atom = Edb | Idb;

export type Rule = [Idb, Atom[]];

export function Conjunction(
    head: any[],
    body: Atom[]
    ): (...inputs: Iterable<Tuple>[]) => Iterable<Tuple>
{
    return (...inputs: Iterable<Tuple>[]): Iterable<Tuple> =>
    {
        let inputIndex = 0;
        return body.reduce(
            (substitutions, atom) =>
            {
                if(typeof atom === 'function')
                    return [...atom(substitutions)];

                let count = substitutions.length;
                while(count--)
                {
                    const substitution = substitutions.shift();
                    for(const tuple of inputs[inputIndex])
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

                ++inputIndex;
                return substitutions;
            },
            [{}]).map(substitution => head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
    };
}

export function Disjunction<T extends Tuple>(
    tupleCompare: Compare<T>
    ): (...inputs: Iterable<T>[]) => SortedSet<T>
{
    return (...inputs: Iterable<T>[]): SortedSet<T> =>
    {
        let set = new SortedSet<T>(tupleCompare);
        for(const input of inputs)
            for(const tuple of input)
                set.add(tuple)
        return set;
    };
}

export function RecursiveDisjunction(
    tupleCompare: Compare<Tuple>,
    rules       : Rule[]
    ): [(...inputs: [SortedSet<Tuple>, ...Iterable<Tuple>[]]) => SortedSet<Tuple>, (Fact | Idb)[]]
{
    type InputType = [SortedSet<Tuple>, ...Iterable<Tuple>[]];
    const wrappedInputs = new ArrayKeyedMap<Fact | Idb, Wrapped<Iterable<Tuple>>>();
    const inputAtoms: (Fact | Idb)[] = [];
    let inputs: InputType;

    const disjunction = (...params: InputType): SortedSet<Tuple> =>
    {
        const [resultTMinus1, ...conjunctions] = params;
        const resultT = new SortedSet(resultTMinus1);
        for(const conjunction of conjunctions)
            for(const tuple of conjunction)
                resultT.add(tuple);

        return resultT;
    };

    const wrappedDisjunctionPredecessors: [() => SortedSet<Tuple>, ...Wrapped<Iterable<Tuple>>[]] = [() => inputs[0] || new SortedSet(tupleCompare)];

    for(const rule of rules)
    {
        const conjunction = Conjunction(
            rule[0][0] === '' ? rule[0].slice(1) : rule[0],
            rule[1]);
        const wrappedConjunctionPredecessors: Wrapped<Iterable<Tuple>>[] = [];

        for(const atom of rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'))
        {
            let wrappedInput: Wrapped<Iterable<Tuple>>;
            if(IsIdb(atom) && atom[0] === rule[0][0])
                wrappedInput = wrappedDisjunctionPredecessors[0];

            else
            {
                wrappedInput = wrappedInputs.get(atom);
                if(!wrappedInput)
                {
                    const index = inputAtoms.push(atom);
                    wrappedInput = () => inputs[index];
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

    return [
        (...params: InputType): SortedSet<Tuple> =>
        {
            inputs = params;
            return wrappedDisjunction();
        },
        inputAtoms];
}

export function Recursion(
    tupleCompare                 : Compare<Tuple>,
    rulesGroupedByPredicateSymbol: [string, Rule[]][]
    ): [(...inputs: Iterable<Tuple>[]) => SortedSet<Tuple>[], (Fact | Idb)[]]
{
    type Result = SortedSet<Tuple>[];
    const empty = new SortedSet(tupleCompare);
    const resultT0: Result = rulesGroupedByPredicateSymbol.map(() => empty);
    let resultTMinus1: Result;
    let inputs: Iterable<Tuple>[];

    const wrappedDisjunctions: Wrapped<SortedSet<Tuple>>[] = [];
    const wrappedInputs = new ArrayKeyedMap<Fact | Idb, Wrapped<Iterable<Tuple>>>();
    const inputAtoms: (Fact | Idb)[] = [];

    rulesGroupedByPredicateSymbol.forEach(
        ([, rules], index) =>
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
