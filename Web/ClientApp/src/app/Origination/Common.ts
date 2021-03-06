import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomainObject, Guid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';

@Component(
    {
        selector: 'common',
        templateUrl: './Common.html'
    })
export class Common implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;

    constructor(
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(deal => this._deal = deal));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Deal(): Deal
    {
        return this._deal;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
