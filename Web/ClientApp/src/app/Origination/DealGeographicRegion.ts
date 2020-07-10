import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GeographicRegionSelector } from '../Deal/GeographicRegionSelector';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { GeographicRegionHierarchy, GeographicRegionHierarchyMember } from '../GeographicRegionHierarchy';
import { GeographicRegionHierarchyToken } from '../GeographicRegionHierarchyProvider';
import { GeographicRegion, GeographicRegionType } from '../Locations';
import { Subdivision } from '../Iso3166';

@Component(
    {
        selector: '[deal-geographic-region]',
        templateUrl: './DealGeographicRegion.html'
    })
export class DealGeographicRegion implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _map          = new Map<string, GeographicRegionHierarchyMember>();
    private _regions      : GeographicRegionHierarchyMember[];
    private _deal         : Deal;
    private _region       : GeographicRegion;
    private _country      : GeographicRegion;
    private _subdivision  : Subdivision;

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
                            geographicRegionHierarchyMember.Member.Id,
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

    get Category(): string
    {
        return this._subdivision != null ? this._subdivision.Category
            .replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase()) : null;
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

        if(this._deal.GeographicRegion.Type == GeographicRegionType.Iso3166_2Subdivision)
        {
            this._subdivision = <Subdivision>this._deal.GeographicRegion;
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
        this._country = this._map.get(this._subdivision.Id).Parent.Member;
        this.ComputeRegion();
    }

    ComputeRegion(): void
    {
        let countryMember = this._map.get(this._country.Id);

        this._region = this._regions
            .find(geographicRegionHierarchyMember =>
                geographicRegionHierarchyMember.Interval.Start < countryMember.Interval.Start &&
                geographicRegionHierarchyMember.Interval.End   > countryMember.Interval.End).Member;
    }
}
