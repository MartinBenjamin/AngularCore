import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { Facility } from '../FacilityAgreements';

@Component(
    {
        selector: 'facilities',
        templateUrl: './Facilities.html'
    })
export class Facilities implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _facilities   : Facility[]
    private _selected     : Facility;

    constructor(
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    if(!deal)
                        this._deal = null;

                    else
                        this._deal = deal[0];

                    this.ComputeFacilities();
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Selected(): Facility
    {
        return this._selected;
    }

    set Selected(
        selected: Facility
        )
    {
        this._selected = selected;
    }

    Add(): void
    {
        this._selected = <Facility>
            {
                Id                       : EmptyGuid,
                Obligors                 : [],
                Contract                 : null,
                Name                     : '',
                Currency                 : null,
                TotalCommitments         : null,
                AvailabilityPeriodEndDate: null,
                MaturityDate             : null,
                MultiCurrency            : null,
                Committed                : null
            };
    }

    private ComputeFacilities(): void
    {
        if(!this._deal)
        {
            this._facilities = null;
            return;
        }

        this._facilities = <Facility[]>this._deal.Commitments.filter(commitment => (<any>commitment).$type == 'Web.Model.Facility, Web');
    }
}
