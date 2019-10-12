import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Currency } from './Iso4217';
import { CurrenciesToken } from './CurrencyServiceProvider';
import { LoadableArray } from './LoadableArray';

@Component({
  selector: 'KeyDealData',
  templateUrl: './KeyDealData.html'
})
export class KeyDealData
{
  private _currencies: LoadableArray<Currency>;

  constructor(
    @Inject(CurrenciesToken)
    currenciesObserver: Observable<LoadableArray<Currency>>
    )
  {
    currenciesObserver.subscribe(currencies => this._currencies = currencies);
  }

  get Currencies(): LoadableArray<Currency>
  {
    return this._currencies;
  }
}
