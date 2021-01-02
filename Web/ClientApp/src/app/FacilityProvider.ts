import { BehaviorSubject, Observable } from "rxjs";
import { Facility } from "./FacilityAgreements";

export abstract class FacilityProvider extends Observable<Facility>
{
    protected _facility = new BehaviorSubject<Facility>(null);

    protected constructor()
    {
        super(
            subscriber =>
            {
                const subscription = this._facility.subscribe(facility => subscriber.next(facility));
                subscriber.add(() => subscription.unsubscribe);
            });
    }
}
