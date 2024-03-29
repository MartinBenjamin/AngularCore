import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { INamedService, NamedFilters, NamedService } from './INamedService';
import { Currency } from './Iso4217';

export const CurrencyServiceToken = new InjectionToken<INamedService<string, Currency, NamedFilters>>('CurrencyService');
export const CurrencyServiceUrlToken = new InjectionToken<string>('CurrencyServiceUrl');
export const CurrenciesToken = new InjectionToken<Observable<Currency[]>>('Currencies');
export const CurrenciesOrderedByCodeToken = new InjectionToken<Observable<Currency[]>>('CurrenciesOrderedByCodeToken');

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
        ) => currencyService.Find(new NamedFilters()).pipe(shareReplay(1)),
    deps: [CurrencyServiceToken]
};

export const CurrenciesOrderedByCode: Provider =
{
    provide: CurrenciesOrderedByCodeToken,
    useFactory: (
        currencies: Observable<Currency[]>
        ) => currencies.pipe(map(currencies => [...currencies].sort((lhs, rhs) => lhs.AlphabeticCode.localeCompare(rhs.AlphabeticCode)))),
    deps: [CurrenciesToken]
};
