import { IsVariable } from "./EavStore";

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
                if(comparison(
                    IsVariable(lhs) ? substitution[lhs] : lhs,
                    IsVariable(rhs) ? substitution[rhs] : rhs))
                    yield substitution;
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

                if(IsVariable(result) &&
                   !(result in substitution))
                    yield {
                        ...substitution,
                        result: actualResult
                    };

                const expectedResult = IsVariable(result) ? substitution[result] : result
                if(expectedResult === actualResult)
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
