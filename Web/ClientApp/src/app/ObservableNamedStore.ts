import { Observable, Subscriber } from "rxjs";
import { Named } from "./CommonDomainObjects";
import { INamedService, NamedFilters } from "./INamedService";

export class ObservableNamedStore<TId, TNamed extends Named<TId>> extends Observable<TNamed[]>
{
    private _named      : TNamed[];
    private _subscribers: Subscriber<TNamed[]>[];

    constructor(
        namedService: INamedService<TId, TNamed, NamedFilters>
        )
    {
        super(
            subscriber =>
            {
                if(!this._subscribers)
                {
                    this._subscribers = [];
                    namedService.Find(new NamedFilters()).subscribe(
                        result =>
                        {
                            this._named = result;
                            this._subscribers.forEach(subscriber => subscriber.next(this._named));
                        });
                }

                this._subscribers.push(subscriber);

                subscriber.add(
                    () =>
                    {
                        const index = this._subscribers.indexOf(subscriber);

                        if(index != -1)
                            this._subscribers.splice(
                                index,
                                1);
                    });

                if(this._named)
                    subscriber.next(this._named);
            });
    }
}
