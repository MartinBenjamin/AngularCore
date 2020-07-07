import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { GeographicRegionHierarchy } from '../GeographicRegionHierarchy';
import { GeographicRegionHierarchyToken } from '../GeographicRegionHierarchyProvider';
import { GeographicRegionSelector } from '../Deal/GeographicRegionSelector';

@Component(
    {
        selector: '[deal-geographic-region]',
        templateUrl: './DealGeographicRegion.html'
    })
export class DealGeographicRegion implements OnDestroy
{
    private _subscriptions            : Subscription[] = [];
    private _geographicRegionHierarchy: GeographicRegionHierarchy;
    private _deal                     : Deal;

    @ViewChild('geographicRegionSelector')
    private _geographicRegionSelector: GeographicRegionSelector;

    constructor(
        @Inject(GeographicRegionHierarchyToken)
        geographicRegionHierarchy: Observable<GeographicRegionHierarchy>,
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(
            geographicRegionHierarchy.subscribe(
                result =>
                {
                    this._geographicRegionHierarchy = result;
                }));

        this._subscriptions.push(dealProvider.subscribe(deal => this._deal = deal));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    public Find(): void
    {
        this._geographicRegionSelector.Select(
            geographicRegion => { });
    }
}
