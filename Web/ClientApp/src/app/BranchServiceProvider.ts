import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { INamedService, NamedFilters, NamedService } from "./INamedService";
import { Branch } from "./Organisations";

export const BranchServiceToken = new InjectionToken<INamedService<string, Branch, NamedFilters>>('BranchService');
export const BranchServiceUrlToken = new InjectionToken<string>('BranchServiceUrl');
export const BranchesToken = new InjectionToken<Observable<Branch[]>>('Branches');

export const BranchServiceProvider: Provider =
{
    provide: BranchServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
        ) => new NamedService<string, Branch, NamedFilters>(
        http,
        url),
    deps: [HttpClient, BranchServiceUrlToken]
};

export const BranchesProvider: Provider =
{
    provide: BranchesToken,
    useFactory: (
        branchService: INamedService<string, Branch, NamedFilters>
        ) => branchService.Find(new NamedFilters()).pipe(shareReplay(1)),
    deps: [BranchServiceToken]
};
