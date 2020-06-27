import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CurrenciesToken } from '../CurrencyServiceProvider';
import { Currency } from '../Iso4217';

@Component(
    {
        templateUrl: './KeyDealData.html',
        encapsulation: ViewEncapsulation.None
    })
export class KeyDealData
{
    constructor(
        @Inject(CurrenciesToken)
        private _currencies: Observable<Currency[]>
        )
    {
    }

    get Currencies(): Observable<Currency[]>
    {
        return this._currencies;
    }
}
