import { BehaviorSubject, Observable } from "rxjs";
import { Deal } from "./Deals";
import { Error } from './Ontologies/ObserveErrors';

export abstract class DealProvider extends Observable<Deal>
{
    protected _deal          = new BehaviorSubject<Deal>(null);
    protected _errors        : Observable<Map<any, Map<string, Set<Error>>>>;
    protected _observeErrors = new BehaviorSubject<boolean>(false);

    protected constructor()
    {
        super(
            subscriber =>
            {
                const subscription = this._deal.subscribe(deal => subscriber.next(deal));
                subscriber.add(subscription);
            });
    }

    get Errors(): Observable<Map<any, Map<string, Set<Error>>>>
    {
        return this._errors;
    }

    get ObserveErrors(): Observable<boolean>
    {
        return this._observeErrors;
    }
}
