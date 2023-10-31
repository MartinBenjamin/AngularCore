export function Compose<TIn extends any[], TOut>(
    map: (...params: TIn) => TOut,
    ...params: { [Parameter in keyof TIn]: () => TIn[Parameter]; }): () => TOut
{
    return () => map(...<TIn>params.map(params => params()));
}
