import { Variable } from "./Datalog";

export class Aggregation
{
    constructor(
        public readonly Aggregate: (substitutions: object[]) => number,
        public readonly Variable?: Variable
        )
    {
    }
}

export function Count(): Aggregation
{
    return new Aggregation(substitutions => substitutions.length);
}

export function Sum(
    variable: Variable
    ): Aggregation
{
    return new Aggregation(
        substitutions => substitutions.reduce(
            (total, substitution) => total + substitution[variable],
            0),
        variable);
}
