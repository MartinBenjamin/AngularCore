import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import * as facilityAgreements from '../FacilityAgreements';
import { Facility } from './Facility';

@Component(
    {
        selector: 'facilities',
        templateUrl: './Facilities.html'
    })
export class Facilities implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _facilities   : facilityAgreements.Facility[]

    @ViewChild('facility')
    private _facility: Facility;

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

    Add(): void
    {
        this._facility.Facility = <facilityAgreements.Facility>
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

        this._facilities = <facilityAgreements.Facility[] > this._deal.Commitments.filter(commitment => (<any>commitment).$type == 'Web.Model.Facility, Web');
    }
}
