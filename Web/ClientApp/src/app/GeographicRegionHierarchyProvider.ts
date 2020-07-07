import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Guid } from './CommonDomainObjects';
import { GeographicRegionHierarchy } from './GeographicRegionHierarchy';
import { DomainObjectService, IDomainObjectService } from './IDomainObjectService';
import { Observable } from 'rxjs';
import { ObservableDomainObjectStore } from './ObservableDomainObjectStore';

export const GeographicRegionHierarchyServiceToken = new InjectionToken<IDomainObjectService<Guid, GeographicRegionHierarchy>>('GeographicRegionHierarchyService');
export const GeographicRegionHierarchyServiceUrlToken = new InjectionToken<string>('GeographicRegionHierarchyServiceUrl');
export const GeographicRegionHierarchyToken = new InjectionToken<Observable<GeographicRegionHierarchy>>('GeographicRegionHierarchy');

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

export const GeographicRegionHierarchyProvider: Provider =
{
    provide: GeographicRegionHierarchyToken,
    useFactory: (
        geographicRegionHierarchyService: IDomainObjectService<Guid, GeographicRegionHierarchy>
        ) => new ObservableDomainObjectStore<Guid, GeographicRegionHierarchy>(
        geographicRegionHierarchyService,
        '80bd57c5-7f3a-48d6-ba89-ad9ddaf12ebb'),
    deps: [GeographicRegionHierarchyServiceToken]
}
