import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Guid } from './CommonDomainObjects';
import { GeographicRegionHierarchy } from './GeographicRegionHierarchy';
import { DomainObjectService, IDomainObjectService } from './IDomainObjectService';

export const GeographicRegionHierarchyServiceToken = new InjectionToken<IDomainObjectService<Guid, GeographicRegionHierarchy>>('GeographicRegionHierarchyService');
export const GeographicRegionHierarchyServiceUrlToken = new InjectionToken<string>('GeographicRegionHierarchyServiceUrl');

export const GeographicRegionHierarchyServiceProvider: Provider =
{
    provide: GeographicRegionHierarchyServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
    ) => new DomainObjectService<Guid, GeographicRegionHierarchy>(
        http,
        url),
    deps: [HttpClient, GeographicRegionHierarchyServiceUrlToken]
};
