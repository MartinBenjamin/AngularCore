import { ArrayKeyedMap } from "../Collections/ArrayKeyedMap";
import { Compare, SortedSet } from "../Collections/SortedSet";
import { Wrap, Wrapped } from "../Wrap";
import { Atom, Fact, Idb, IsConstant, IsIdb, IsVariable, Rule } from "./IEavStore";
import { Tuple } from "./Tuple";

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
