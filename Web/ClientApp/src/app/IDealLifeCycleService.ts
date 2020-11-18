import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, Provider } from "@angular/core";
import { Observable } from "rxjs";
import { Guid } from "./CommonDomainObjects";
import { DomainObjectService, IDomainObjectService } from "./IDomainObjectService";
import { LifeCycle, LifeCycleStage } from "./LifeCycles";
import { newReferenceDeserialiser } from "./ReferenceSerialisation";

export const DealLifeCycleServiceToken = new InjectionToken<IDealLifeCycleService>('DealLifeCycleService');
export const DealLifeCycleServiceUrlToken = new InjectionToken<string>('DealLifeCycleServiceeUrl');

export const DealLifeCycleServiceProvider: Provider =
{
    provide: DealLifeCycleServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
    ) => new DealLifeCycleService(
        http,
        url),
    deps: [HttpClient, DealLifeCycleServiceUrlToken]
};

export interface IDealLifeCycleService extends IDomainObjectService<Guid, LifeCycle>
{
    GetStages(
        id     : Guid,
        phaseId: Guid): Observable<LifeCycleStage[]>;
}

@Injectable()
export class DealLifeCycleService
    extends DomainObjectService<Guid, LifeCycle>
    implements IDealLifeCycleService
{
    constructor(
        http: HttpClient,
        url : string
        )
    {
        super(
            http,
            url);
    }

    GetStages(
        id     : Guid,
        phaseId: Guid
        ): Observable<LifeCycleStage[]>
    {
        return this._http.get<LifeCycleStage[]>(`${this._url}/${id.toString()}/phase/${phaseId.toString()}`)
            .map(newReferenceDeserialiser());
    }
}
