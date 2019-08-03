import { Hierarchical } from './Hierarchical';

export enum PredicateType
{
    Terminal,
    Conjunction,
    Disjunction
}

interface IPredicateEvaluation
{
    Type       : PredicateType;
    Result     : boolean;
    Description: string;
}

export type PredicateEvaluation = Hierarchical<IPredicateEvaluation>;
