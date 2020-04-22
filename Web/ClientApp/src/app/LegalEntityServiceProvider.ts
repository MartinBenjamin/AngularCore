import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Guid } from './CommonDomainObjects';
import { INamedService, NamedFilters, NamedService } from "./INamedService";
import { LegalEntity } from "./LegalEntities";

export const LegalEntityServiceToken = new InjectionToken<INamedService<string, LegalEntity, NamedFilters>>('LegalEntityService');
export const LegalEntityServiceUrlToken = new InjectionToken<string>('LegalEntityServiceUrl');

export const LegalEntityServiceProvider: Provider =
{
    provide: LegalEntityServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
    ) => new NamedService<Guid, LegalEntity, NamedFilters>(
        http,
        url),
    deps: [HttpClient, LegalEntityServiceUrlToken]
};
