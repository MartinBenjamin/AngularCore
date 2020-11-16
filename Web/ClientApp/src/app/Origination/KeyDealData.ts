import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { CurrenciesToken } from '../CurrencyServiceProvider';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { Currency } from '../Iso4217';

@Component(
    {
        templateUrl: './KeyDealData.html',
        encapsulation: ViewEncapsulation.None
    })
export class KeyDealData implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;

    constructor(
        @Inject(CurrenciesToken)
        private _currencies: Observable<Currency[]>,
        dealProvider       : DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(deal => this._deal = deal[0]));

    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Currencies(): Observable<Currency[]>
    {
        return this._currencies;
    }

    get Deal(): Deal
    {
        return this._deal;
    }
}
