import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { INamedService, NamedFilters, NamedService } from "./INamedService";
import { Role } from './Roles';


export const RoleServiceToken = new InjectionToken<INamedService<string, Role, NamedFilters>>('RoleService');
export const RoleServiceUrlToken = new InjectionToken<string>('RoleServiceUrl');
export const RolesToken = new InjectionToken<Observable<Role[]>>('Roles');

export const RoleServiceProvider: Provider =
{
    provide: RoleServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
        ) => new NamedService<string, Role, NamedFilters>(
        http,
        url),
    deps: [HttpClient, RoleServiceUrlToken]
};

export const RolesProvider: Provider =
{
    provide: RolesToken,
    useFactory: (
        roleService: INamedService<string, Role, NamedFilters>
        ) => roleService.Find(new NamedFilters()).pipe(shareReplay(1)),
    deps: [RoleServiceToken]
};
