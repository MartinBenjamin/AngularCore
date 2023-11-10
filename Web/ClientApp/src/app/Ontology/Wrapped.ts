import { Observable } from 'rxjs';
import { Signal } from '../Signal/Signal';

export enum WrapperType
{
    Observable,
    Signal
}

export type Wrapped<WrapperType, T> =
    WrapperType extends WrapperType.Observable ? Observable<T> :
    WrapperType extends WrapperType.Signal     ? Signal<T> :
    never;

export interface Wrap<T extends WrapperType>
{
    <TIn extends any[], TOut>(
        map: (...params: TIn) => TOut,
        ...params: { [Parameter in keyof TIn]: Wrapped<T, TIn[Parameter]>; }): Wrapped<T, TOut>
}
