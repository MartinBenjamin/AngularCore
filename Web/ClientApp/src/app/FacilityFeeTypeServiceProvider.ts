import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Observable } from 'rxjs';
import { Guid } from './CommonDomainObjects';
import { FeeType } from './FacilityAgreements';
import { INamedService, NamedFilters, NamedService } from "./INamedService";
import { ObservableNamedStore } from './ObservableNamedStore';

export const FacilityFeeTypeServiceToken = new InjectionToken<INamedService<string, FeeType, NamedFilters>>('FacilityFeeTypeService');
export const FacilityFeeTypeServiceUrlToken = new InjectionToken<string>('FacilityFeeTypeServiceUrl');
export const FacilityFeeTypesToken = new InjectionToken<Observable<FeeType[]>>('FacilityFeeTypes');

export const FacilityFeeTypeServiceProvider: Provider =
{
    provide: FacilityFeeTypeServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
        ) => new NamedService<string, FeeType, NamedFilters>(
        http,
        url),
    deps: [HttpClient, FacilityFeeTypeServiceUrlToken]
};

export const FacilityFeeTypesProvider: Provider =
{
    provide: FacilityFeeTypesToken,
    useFactory: (
        FacilityFeeTypeService: INamedService<string, FeeType, NamedFilters>
        ) => new ObservableNamedStore<Guid, FeeType>(FacilityFeeTypeService),
    deps: [FacilityFeeTypeServiceToken]
};
