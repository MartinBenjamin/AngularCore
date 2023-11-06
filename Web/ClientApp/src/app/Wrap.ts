export function Wrap<TIn extends any[], TOut>(
    map: (...inputs: TIn) => TOut,
    ...wrappedInputs: { [Parameter in keyof TIn]: () => TIn[Parameter]; }): () => TOut
{
    return () => map(...<TIn>wrappedInputs.map(wrappedInput => wrappedInput()));
}
