import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { GeographicRegionHierarchy } from '../GeographicRegionHierarchy';
import { GeographicRegionHierarchyToken } from '../GeographicRegionHierarchyProvider';
import { GeographicRegionSelector } from '../Deal/GeographicRegionSelector';
import { Subdivision } from '../Iso3166';
import { GeographicRegion } from '../Locations';

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
    private _region                   : GeographicRegion;
    private _country                  : GeographicRegion;
    private _subdivision              : GeographicRegion;

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

    get Region(): GeographicRegion
    {
        return this._region;
    }

    get Country(): GeographicRegion
    {
        return this._country;
    }

    get Subdivision(): GeographicRegion
    {
        return this._subdivision;
    }

    Find(): void
    {
        this._geographicRegionSelector.Select(
            geographicRegion =>
            {
                this._deal.GeographicRegion = geographicRegion;
                this.ComputeSubdivision();
            });
    }

    ComputeSubdivision(): void
    {
        if(!(this._geographicRegionHierarchy && this._deal && this._deal.GeographicRegion))
        {
            this._region      = null;
            this._country     = null;
            this._subdivision = null;
        }

        if((<any>this._deal.GeographicRegion).$type == 'Web.Model.Subdivision, Web')
        {
            this._subdivision = this._deal.GeographicRegion;
            this.ComputeCountry()
        }
        else
        {
            this._country = this._deal.GeographicRegion;
            this.ComputeRegion();
        }
    }

    ComputeCountry(): void
    {

    }

    ComputeRegion(): void
    {

    }
}
