import { BehaviorSubject, Observable } from "rxjs";
import { Named } from "./CommonDomainObjects";
import { INamedService, NamedFilters } from "./INamedService";

export class ObservableNamedStore<TId, TNamed extends Named<TId>> extends Observable<TNamed[]>
{
    private _dataStore: BehaviorSubject<TNamed[]>;

    constructor(
        namedService: INamedService<TId, TNamed, NamedFilters>
        )
    {
        super(
            subscriber =>
            {
                if(!this._dataStore)
                {
                    this._dataStore = new BehaviorSubject<TNamed[]>(null);
                    namedService.Find(new NamedFilters()).subscribe(result => this._dataStore.next(result));
                }

                const subscription = this._dataStore.subscribe(
                    value => subscriber.next(value),
                    error => subscriber.error(error),
                    ()    => subscriber.complete());

                subscriber.add(subscription);
            });
    }
}
