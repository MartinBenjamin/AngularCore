import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Named } from './CommonDomainObjects';
import { newReferenceDeserialiser } from './ReferenceSerialisation';

export class NamedFilters
{
  NameFragment: string;
  MaxResults? : number;
}

export interface INamedService<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters>
{
    Get(id: TId): Observable<TNamed>;
    Find(filters: TNamedFilters): Observable<TNamed[]>;
}

@Injectable()
export class NamedService<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters> implements INamedService<TId, TNamed, TNamedFilters>
{
    constructor(
        private _http: HttpClient,
        private _url: string
        )
    {

    }

    Get(
        id: TId
        ): Observable<TNamed>
    {
        return this._http.get<TNamed>(this._url + '/' + id.toString())
            .map(newReferenceDeserialiser());
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
