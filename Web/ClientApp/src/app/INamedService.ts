
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Named } from './CommonDomainObjects';
import { DomainObjectService, IDomainObjectService } from './IDomainObjectService';
import { newReferenceDeserialiser } from './ReferenceSerialisation';

export class NamedFilters
{
    NameFragment: string;
    MaxResults?: number;
}

export interface INamedService<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters>
    extends IDomainObjectService<TId, TNamed>
{
    Find(filters: TNamedFilters): Observable<TNamed[]>;
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
        let params = new HttpParams();

        for(let key in <object>filters)
        {
            var value = filters[key];
            switch(typeof value)
            {
                case 'string': params = params.set(key, value           ); break;
                case 'number': params = params.set(key, value.toString()); break;
                default: break;
            }
        }

        return this._http.get<TNamed[]>(
            this._url,
            {
                params: params
            }).pipe(map(newReferenceDeserialiser()));
    }
}
