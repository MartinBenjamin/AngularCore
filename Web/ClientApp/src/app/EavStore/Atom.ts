import { IsVariable, Variable } from './IEavStore';

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


function Wrap<T1, TResult>(func: (t1: T1) => TResult): (t1: Variable | T1, result: Variable | TResult) => BuiltIn
function Wrap<T1, T2, TResult>(func: (t1: T1, t2: T2) => TResult): (t1: Variable | T1, t2: Variable | T2, result: Variable | TResult) => BuiltIn
function Wrap<TResult>(func:(...params) => TResult): () => BuiltIn
{
    return function(): BuiltIn
    {
        const args = <[]>[].slice.call(
            arguments,
            0,
            arguments.length - 1);
        const result = arguments[arguments.length - 1];

        return IsVariable(result) ?
            function*(
                substitutions: Iterable<object>
                )
            {
                for(const substitution of substitutions)
                {
                    const actualResult = func.apply(
                        null,
                        args.map(argument => IsVariable(argument) ? substitution[argument] : argument));

                    if(!(result in substitution))
                        yield { ...substitution, [result]: actualResult };

                    else if(substitution[result] === actualResult)
                        yield substitution;
                }
            } :
            function*(
                substitutions: Iterable<object>
                )
            {
                for(const substitution of substitutions)
                {
                    const actualResult = func.apply(
                        null,
                        args.map(argument => IsVariable(argument) ? substitution[argument] : argument));

                    if(result === actualResult)
                        yield substitution;
                }
            }
    }
}

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
                        yield { ...substitution, [result]: actualResult };

                    else if(substitution[result] === actualResult)
                        yield substitution;
                }
                else if(result === actualResult)
                    yield substitution;
            }
        }
    }
};

export const Add       = Wrap((lhs, rhs) => lhs + rhs);
export const Subtract  = Wrap((lhs, rhs) => rhs - lhs);
export const Multiply  = Wrap((lhs, rhs) => lhs * rhs);
export const Divide    = Wrap((lhs, rhs) => rhs / lhs);
export const Remainder = Wrap((lhs, rhs) => rhs % lhs);
