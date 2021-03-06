import { BehaviorSubject, Observable } from "rxjs";
import { Deal } from "./Deals";

export abstract class DealProvider extends Observable<Deal>
{
    protected _deal = new BehaviorSubject<Deal>(null);

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
