import { Deal } from "./Deals";
import { Observable, BehaviorSubject } from "rxjs";

export abstract class DealProvider extends Observable<[Deal, Observable<Map<any, any>>]>
{
    protected _deal = new BehaviorSubject<[Deal, Observable<Map<any, any>>]>(null);

    protected constructor()
    {
        super(
            subscriber =>
            {
                const subscription = this._deal.subscribe(deal => subscriber.next(deal));
                subscriber.add(() => subscription.unsubscribe);
            });
    }
}
