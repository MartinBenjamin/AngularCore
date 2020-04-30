import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { DomainObject, Named } from './CommonDomainObjects';
import { newReferenceDeserialiser } from './ReferenceSerialisation';

export class NamedFilters
{
    NameFragment: string;
    MaxResults?: number;
}

export interface IDomainObjectService<TId, TDomainObject extends DomainObject<TId>>
{
    Get(id: TId): Observable<TDomainObject>;
}

export interface INamedService<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters>
    extends IDomainObjectService<TId, TNamed>
{
    Find(filters: TNamedFilters): Observable<TNamed[]>;
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

@Injectable()
export class NamedService<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters>
    extends DomainObjectService<TId, TNamed>
    implements INamedService<TId, TNamed, TNamedFilters>
{
    constructor(
        http: HttpClient,
        url: string
        )
    {
        super(
            http,
            url)
    }

    Find(
        filters: TNamedFilters
        ): Observable<TNamed[]>
    {
        var params = new HttpParams();

        for(var key in filters)
        {
            var value = filters[key];
            switch(typeof value)
            {
                case 'string': params = params.set(key, value                     ); break;
                case 'number': params = params.set(key, (<number>value).toString()); break;
                default: break;
            }
        }

        return this._http.get<TNamed[]>(
            this._url,
            {
                params: params
            }).map(newReferenceDeserialiser());
    }
}
