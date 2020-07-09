import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GeographicRegionSelector } from '../Deal/GeographicRegionSelector';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { GeographicRegionHierarchy, GeographicRegionHierarchyMember } from '../GeographicRegionHierarchy';
import { GeographicRegionHierarchyToken } from '../GeographicRegionHierarchyProvider';
import { GeographicRegion } from '../Locations';

@Component(
    {
        selector: '[deal-geographic-region]',
        templateUrl: './DealGeographicRegion.html'
    })
export class DealGeographicRegion implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _map          = new Map<GeographicRegion, GeographicRegionHierarchyMember>();
    private _regions      : GeographicRegionHierarchyMember[];
    private _deal         : Deal;
    private _region       : GeographicRegion;
    private _country      : GeographicRegion;
    private _subdivision  : GeographicRegion;

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
                    result.Members.forEach(
                        geographicRegionHierarchyMember => this._map.set(
                            geographicRegionHierarchyMember.Member,
                            geographicRegionHierarchyMember));
                    this._regions = result.Members
                        .find(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Parent == null).Children
                        .filter(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Children.length);
                }));

        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    this.ComputeSubdivision();
                }));
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
        if(!(this._map.size && this._deal && this._deal.GeographicRegion))
        {
            this._region      = null;
            this._country     = null;
            this._subdivision = null;
            return;
        }

        if((<any>this._deal.GeographicRegion).$type == 'Web.Model.Subdivision, Web')
        {
            this._subdivision = this._deal.GeographicRegion;
            this.ComputeCountry()
        }
        else
        {
            this._subdivision = null;
            this._country = this._deal.GeographicRegion;
            this.ComputeRegion();
        }
    }

    ComputeCountry(): void
    {
        this._country = this._map.get(this._subdivision).Parent.Member;
        this.ComputeRegion();
    }

    ComputeRegion(): void
    {
        let countryMember = this._map.get(this._country);

        this._region = this._regions
            .find(geographicRegionHierarchyMember =>
                geographicRegionHierarchyMember.Interval.Start < countryMember.Interval.Start &&
                geographicRegionHierarchyMember.Interval.End   > countryMember.Interval.End).Member;
    }
}
