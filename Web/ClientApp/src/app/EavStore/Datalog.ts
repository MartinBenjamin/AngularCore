import { Compare, SortedSet } from "../Collections/SortedSet";
import { Atom, IsConstant, IsVariable } from "./IEavStore";
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
    )
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
