import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Observable } from 'rxjs';
import { Guid } from './CommonDomainObjects';
import { INamedService, NamedFilters, NamedService } from "./INamedService";
import { Currency } from "./Iso4217";
import { ObservableNamedStore } from './ObservableNamedStore';

export const CurrencyServiceToken = new InjectionToken<INamedService<string, Currency, NamedFilters>>('CurrencyService');
export const CurrencyServiceUrlToken = new InjectionToken<string>('CurrencyServiceUrl');
export const CurrenciesToken = new InjectionToken<Observable<Currency[]>>('Currencies');

export const CurrencyServiceProvider: Provider =
{
    provide: CurrencyServiceToken,
    useFactory: (
        http: HttpClient,
        url: string
        ) => new NamedService<string, Currency, NamedFilters>(
        http,
        url),
    deps: [HttpClient, CurrencyServiceUrlToken]
};

export const CurrenciesProvider: Provider =
{
    provide: CurrenciesToken,
    useFactory: (
        currencyService: INamedService<string, Currency, NamedFilters>
        ) => new ObservableNamedStore<Guid, Currency>(currencyService),
    deps: [CurrencyServiceToken]
}
