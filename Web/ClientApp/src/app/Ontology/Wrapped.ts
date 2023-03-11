import { Observable } from 'rxjs';
import { Signal } from '../Signal';

export enum WrapperType
{
    Observable,
    Signal
}

export type Wrapped<WrapperType, T> =
    WrapperType extends WrapperType.Observable ? Observable<T> :
    WrapperType extends WrapperType.Signal     ? Signal<T> :
    never;
