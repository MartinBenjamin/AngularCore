import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomainObject, Guid } from '../../CommonDomainObjects';
import { CurrenciesToken } from '../../CurrencyServiceProvider';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { Currency } from '../../Iso4217';
import { deals } from '../../Ontologies/Deals';
import { Store } from '../../Ontology/IEavStore';
import { ObservableGenerator } from '../../Ontology/ObservableGenerator';

@Component(
    {
        templateUrl: './KeyDealData.html',
        encapsulation: ViewEncapsulation.None
    })
export class KeyDealData implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _restricted   : Observable<boolean>;

    constructor(
        @Inject(CurrenciesToken)
        private _currencies: Observable<Currency[]>,
        dealProvider       : DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(
            deal =>
            {
                this._deal = deal;
                if(this._deal)
                {
                    const store = Store(this._deal);

                    const generator = new ObservableGenerator(
                        deals,
                        store);

                    this._restricted = deals.Restricted.Select(generator).pipe(map(restricted => restricted.has(this._deal)));
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

    get Restricted(): Observable<boolean>
    {
        return this._restricted;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
