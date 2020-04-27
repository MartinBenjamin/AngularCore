import { Deal } from "./Deals";
import { Observable, BehaviorSubject } from "rxjs";

export abstract class DealProvider extends Observable<Deal>
{
    protected _behaviourSubject = new BehaviorSubject<Deal>(null);

    protected constructor()
    {
        super(
            subscriber =>
            {
                const subscription = this._behaviourSubject.subscribe(deal => subscriber.next(deal));
                subscriber.add(() => subscription.unsubscribe);
            });
    }
}
