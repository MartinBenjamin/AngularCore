import { IsVariable } from "./EavStore";
import { IsDateDescription } from '../Components/Time';

export type BuiltIn = (substitutions: Iterable<object>) => Iterable<object>;

function ComparisonAtom(
    comparison: (lhs, rhs) => boolean
    ): (lhs: any, rhs: any) => BuiltIn
{
    return function(
        lhs: any,
        rhs: any
        ): BuiltIn
    {
        return function*(
            substitutions: Iterable<object>
            )
        {
            for(const substitution of substitutions)
            {
                let currentLhs = IsVariable(lhs) ? substitution[lhs] : lhs;
                let currentRhs = IsVariable(rhs) ? substitution[rhs] : rhs;

                if(IsDateDescription(currentLhs))
                    currentLhs = new Date(Date.UTC(
                        currentLhs.Year,
                        currentLhs.Month - 1,
                        currentLhs.Day));

                if(IsDateDescription(currentRhs))
                    currentRhs = new Date(Date.UTC(
                        currentRhs.Year,
                        currentRhs.Month - 1,
                        currentRhs.Day));

                if(comparison(
                    currentLhs,
                    currentRhs))
                    yield substitution;
            }
        };
    }
};

export const LessThan           = ComparisonAtom((lhs, rhs) => lhs <   rhs);
export const LessThanOrEqual    = ComparisonAtom((lhs, rhs) => lhs <=  rhs);
export const Equal              = ComparisonAtom((lhs, rhs) => lhs === rhs);
export const NotEqual           = ComparisonAtom((lhs, rhs) => lhs !== rhs);
export const GreaterThanOrEqual = ComparisonAtom((lhs, rhs) => lhs >=  rhs);
export const GreaterThan        = ComparisonAtom((lhs, rhs) => lhs >   rhs);

function ArithmeticAtom(
    operation: (lhs, rhs) => any
    ): (lhs: any, rhs: any, result: any) => BuiltIn
{
    return function(
        lhs   : any,
        rhs   : any,
        result: any
        ): BuiltIn
    {
        return function*(
            substitutions: Iterable<object>
            )
        {
            for(const substitution of substitutions)
            {
                const actualResult = operation(
                    IsVariable(lhs) ? substitution[lhs] : lhs,
                    IsVariable(rhs) ? substitution[rhs] : rhs);

                if(IsVariable(result))
                {
                    if(!(result in substitution))
                    {
                        let yielded = { ...substitution };
                        yielded[result] = actualResult;
                        yield yielded;
                    }
                    else if(substitution[result] === actualResult)
                        yield substitution;
                }
                else if(result === actualResult)
                    yield substitution;
            }
        }
    }
};

export const Add       = ArithmeticAtom((lhs, rhs) => lhs + rhs);
export const Subtract  = ArithmeticAtom((lhs, rhs) => rhs - lhs);
export const Multiply  = ArithmeticAtom((lhs, rhs) => lhs * rhs);
export const Divide    = ArithmeticAtom((lhs, rhs) => rhs / lhs);
export const Remainder = ArithmeticAtom((lhs, rhs) => rhs % lhs);
