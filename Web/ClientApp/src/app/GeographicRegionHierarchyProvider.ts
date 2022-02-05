import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Guid } from './CommonDomainObjects';
import { GeographicRegionHierarchy } from './GeographicRegionHierarchy';
import { DomainObjectService, IDomainObjectService } from './IDomainObjectService';

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
        ) => geographicRegionHierarchyService.Get('80bd57c5-7f3a-48d6-ba89-ad9ddaf12ebb').pipe(shareReplay(1)),
    deps: [GeographicRegionHierarchyServiceToken]
}
