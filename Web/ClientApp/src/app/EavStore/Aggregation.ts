import { Variable } from "./Datalog";

export abstract class Aggregation
{
    constructor(
        public readonly Variable?: Variable
        )
    {
    }

    abstract Aggregate(substitutions: object[]): number
}

class CountAggregation extends Aggregation
{
    Aggregate(
        substitutions: object[]
        ): number
    {
        return substitutions.length;
    }
}

export function Count(): Aggregation
{
    return new CountAggregation();
}
