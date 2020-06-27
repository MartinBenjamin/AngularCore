import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CurrenciesToken } from '../CurrencyServiceProvider';
import { Currency } from '../Iso4217';

@Component(
    {
        selector: '[exclusivity]',
        templateUrl: './Exclusivity.html'
    })
export class Exclusivity
{
    constructor(
        //@Inject(CurrenciesToken)
        //private _currencies: Observable<Currency[]>
    )
    {
    }

    //get Currencies(): Observable<Currency[]>
    //{
    //    return this._currencies;
    //}
}
