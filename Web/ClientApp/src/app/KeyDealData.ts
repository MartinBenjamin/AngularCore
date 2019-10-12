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
  constructor(
    @Inject(CurrenciesToken)
    private _currencies: Observable<LoadableArray<Currency>>
    )
  {
  }

  get Currencies(): Observable<LoadableArray<Currency>>
  {
    return this._currencies;
  }
}
