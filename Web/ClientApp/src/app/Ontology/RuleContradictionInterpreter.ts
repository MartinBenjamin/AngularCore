import { AtomInterpreter } from "./AtomInterpreter";
import { IDLSafeRule } from "./DLSafeRule";
import { Wrap, Wrapped, WrapperType } from "./Wrapped";

export function RuleContradictionInterpreter<T extends WrapperType>(
    wrap       : Wrap<T>,
    interpreter: AtomInterpreter<T>
    ): (rule: IDLSafeRule) => Wrapped<T, object[]>
{
    return (rule: IDLSafeRule) => wrap(
        (head, body) => body.reduce<object[]>(
            (contradictions, x) =>
            {
                if(!head.some(y =>
                {
                    for(const key in x)
                        if(key in y && x[key] !== y[key])
                            return false;
                    return true;
                }))
                    contradictions.push(x);

                return contradictions;
            },
            []),
        interpreter.Conjunction(rule.Head),
        interpreter.Conjunction(rule.Body));
}
