import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DomainObject, Guid } from '../CommonDomainObjects';
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
    private _errors       : any;


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
                        deal[1].subscribe(
                            errors =>
                            {
                                this._errors = null;
                                if(errors)
                                {
                                    let dealErrors = errors.get(this._deal);
                                    if(dealErrors)
                                    {
                                        this._errors = {};
                                        [...errors.get(this._deal)].forEach(propertyErrors => this._errors[propertyErrors[0]] = propertyErrors[1]);
                                    }
                                }
                            });
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

    get Errors(): any
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
