import { BehaviorSubject, Observable } from "rxjs";
import { Named } from "./CommonDomainObjects";
import { INamedService, NamedFilters } from "./INamedService";

export class ObservableNamedStore<TId, TNamed extends Named<TId>> extends Observable<TNamed[]>
{
    private _namedStore: BehaviorSubject<TNamed[]>;

    constructor(
        namedService: INamedService<TId, TNamed, NamedFilters>
        )
    {
        super(
            subscriber =>
            {
                if(!this._namedStore)
                {
                    this._namedStore = new BehaviorSubject<TNamed[]>(null);
                    namedService.Find(new NamedFilters()).subscribe(result => this._namedStore.next(result));
                }

                const subscription = this._namedStore.subscribe(
                    value => subscriber.next(value),
                    error => subscriber.error(error),
                    ()    => subscriber.complete());

                subscriber.add(subscription);
            });
    }
}
