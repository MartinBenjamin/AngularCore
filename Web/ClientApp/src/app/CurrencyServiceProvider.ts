import { HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from "@angular/core";
import 'rxjs/add/operator/map';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { INamedService, NamedFilters, NamedService } from "./INamedService";
import { Currency } from "./Iso4217";

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
        ) =>
    {
        const currencies = new BehaviorSubject<Currency[]>(null);
        currencyService.Find(new NamedFilters()).subscribe(currencies);
        return currencies;
    },
    deps: [CurrencyServiceToken]
}
