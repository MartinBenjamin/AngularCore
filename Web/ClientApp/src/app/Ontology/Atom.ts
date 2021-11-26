import { IsVariable } from "./EavStore";

function ComparisonAtom(
    comparison: (lhs, rhs) => boolean
    ): (lhs: any, rhs: any) => (substitution: object) => Generator<object>
{
    return function(
        lhs: any,
        rhs: any
        ): (substitution: object) => Generator<object>
    {
        return function*(
            substitution: object
            )
        {
            lhs = IsVariable(lhs) ? substitution[lhs] : lhs;
            rhs = IsVariable(rhs) ? substitution[rhs] : rhs;
            if(comparison(lhs, rhs))
                yield substitution;
        };
    }
};

export const LessThan               = ComparisonAtom((lhs, rhs) => lhs <   rhs);
export const LessThanOrEqual        = ComparisonAtom((lhs, rhs) => lhs <=  rhs);
export const Equal                  = ComparisonAtom((lhs, rhs) => lhs === rhs);
export const GreaterThanOrEqualThan = ComparisonAtom((lhs, rhs) => lhs >=  rhs);
export const GreaterThan            = ComparisonAtom((lhs, rhs) => lhs >   rhs);

function ArithmeticAtom(
    operation: (lhs, rhs) => any
    ): (lhs: any, rhs: any, result: any) => (substitution: object) => Generator<object>
{
    return function(
        lhs   : any,
        rhs   : any,
        result: any
        ): (substitution: object) => Generator<object>
    {
        return function*(
            substitution: object
            )
        {
            lhs    = IsVariable(lhs   ) ? substitution[lhs   ] : lhs;
            rhs    = IsVariable(rhs   ) ? substitution[rhs   ] : rhs;
            result = IsVariable(result) ? substitution[result] : result;
            if(IsVariable(result))
                yield { ...substitution, result: operation(lhs, rhs) };

            else if(operation(lhs, rhs) === result)
                yield substitution;
        }
    }
};

export const Add      = ArithmeticAtom((lhs, rhs) => lhs + rhs);
export const Subtract = ArithmeticAtom((lhs, rhs) => rhs - lhs);
