import { Observable, Subscriber } from "rxjs";
import { DomainObject } from "./CommonDomainObjects";
import { IDomainObjectService } from "./IDomainObjectService";

export class ObservableDomainObjectStore<TId, TDomainObject extends DomainObject<TId>> extends Observable<TDomainObject>
{
    private _domainObject: TDomainObject;
    private _subscribers: Subscriber<TDomainObject>[];

    constructor(
        domainObjectService: IDomainObjectService<TId, TDomainObject>,
        id: TId
        )
    {
        super(
            subscriber =>
            {
                if(!this._subscribers)
                {
                    this._subscribers = [];
                    domainObjectService.Get(id).subscribe(
                        result =>
                        {
                            this._domainObject = result;
                            this._subscribers.forEach(subscriber => subscriber.next(this._domainObject));
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

                if(this._domainObject)
                    subscriber.next(this._domainObject);
            });
    }
}
