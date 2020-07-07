import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Guid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { GeographicRegionHierarchyServiceToken } from '../GeographicRegionHierarchyProvider';
import { IDomainObjectService } from '../IDomainObjectService';

@Component(
    {
        selector: '[deal-geographic-region]',
        templateUrl: './DealGeographicRegion.html'
    })
export class DealGeographicRegion implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;

    constructor(
        @Inject(GeographicRegionHierarchyServiceToken)
        geographicRegionHierarchyService: IDomainObjectService<Guid, GeographicRegionHierarchy>
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(deal => this._deal = deal));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
