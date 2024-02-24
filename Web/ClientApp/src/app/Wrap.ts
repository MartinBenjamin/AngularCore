export type Wrapped<T> = () => T;

export function Wrap<TIn extends any[], TOut>(
    map: (...inputs: TIn) => TOut,
    ...wrappedInputs: { [Parameter in keyof TIn]: Wrapped<TIn[Parameter]>; }): Wrapped<TOut>
{
    return () => map(...<TIn>wrappedInputs.map(wrappedInput => wrappedInput()));
}
