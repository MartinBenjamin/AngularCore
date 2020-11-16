import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { CurrenciesToken } from '../CurrencyServiceProvider';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { Currency } from '../Iso4217';
import { DomainObject, Guid } from '../CommonDomainObjects';

@Component(
    {
        templateUrl: './KeyDealData.html',
        encapsulation: ViewEncapsulation.None
    })
export class KeyDealData implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _errors       : object;


    constructor(
        @Inject(CurrenciesToken)
        private _currencies: Observable<Currency[]>,
        dealProvider       : DealProvider
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    if(!deal)
                    {
                        this._deal   = null;
                        this._errors = null;
                    }
                    else
                    {
                        this._deal = deal[0];
                        deal[1].subscribe(errors => this._errors = errors ? errors.get(this._deal) : null);
                    }
                }));
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

    get Errors(): object
    {
        return this._errors;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
