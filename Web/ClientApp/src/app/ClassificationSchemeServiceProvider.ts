import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { ClassificationScheme } from './ClassificationScheme';
import { Guid } from './CommonDomainObjects';
import { DomainObjectService, IDomainObjectService } from './IDomainObjectService';

export const ClassificationSchemeServiceToken = new InjectionToken<IDomainObjectService<Guid, ClassificationScheme>>('ClassificationSchemeService');
export const ClassificationSchemeServiceUrlToken = new InjectionToken<string>('ClassificationSchemeServiceUrl');

export const ClassificationSchemeServiceProvider: Provider =
{
    provide: ClassificationSchemeServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
    ) => new DomainObjectService<Guid, ClassificationScheme>(
        http,
        url),
    deps: [HttpClient, ClassificationSchemeServiceUrlToken]
};
