import { BehaviorSubject, Observable } from "rxjs";
import { Deal } from "./Deals";
import { IErrors } from "./Ontologies/Validate";

export abstract class DealProvider extends Observable<[Deal, Observable<Map<object, Map<string, Set<keyof IErrors>>>>]>
{
    protected _deal = new BehaviorSubject<[Deal, Observable<Map<object, Map<string, Set<keyof IErrors>>>>]>(null);

    protected constructor()
    {
        super(
            subscriber =>
            {
                const subscription = this._deal.subscribe(deal => subscriber.next(deal));
                subscriber.add(subscription);
            });
    }
}
