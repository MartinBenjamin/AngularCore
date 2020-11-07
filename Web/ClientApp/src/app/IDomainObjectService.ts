import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DomainObject } from './CommonDomainObjects';
import { newReferenceDeserialiser } from './ReferenceSerialisation';

export interface IDomainObjectService<TId, TDomainObject extends DomainObject<TId>>
{
    Get(id: TId): Observable<TDomainObject>;
}

@Injectable()
export class DomainObjectService<TId, TDomainObject extends DomainObject<TId>> implements IDomainObjectService<TId, TDomainObject>
{
    constructor(
        protected _http: HttpClient,
        protected _url: string
        )
    {
    }

    Get(
        id: TId
        ): Observable<TDomainObject>
    {
        return this._http.get<TDomainObject>(this._url + '/' + id.toString())
            .map(newReferenceDeserialiser());
    }
}
