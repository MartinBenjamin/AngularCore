import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { Facility } from '../Deal/Facility';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import * as facilityAgreements from '../FacilityAgreements';

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

    // TODO add Component suffix to every component.
    get facilities(): facilityAgreements.Facility[]
    {
        return this._facilities;
    }

    Add(): void
    {
        let facility = <facilityAgreements.Facility>
        {
            Id                       : EmptyGuid,
            Obligors                 : [],
            Contract                 : null,
            PartOf                   : null,
            Parts                    : [],
            Name                     : '',
            Currency                 : null,
            TotalCommitments         : null,
            AvailabilityPeriodEndDate: null,
            MaturityDate             : null,
            Expected1StDrawdownDate  : null,
            MultiCurrency            : null,
            Committed                : null
        };

        (<any>facility).$type = 'Web.Model.Facility, Web';

        let lenderParticipation = <facilityAgreements.LenderParticipation>
        {
            Id                   : EmptyGuid,
            Obligors             : [],
            Contract             : null,
            PartOf               : facility,
            Parts                : [],
            Lender               : null,
            Amount               : null,
            UnderwriteAmount     : null,
            CreditSoughtLimit    : null,
            AnticipatedHoldAmount: null,
            ActualAllocation     : null
        };
        (<any>lenderParticipation).$type = 'Web.Model.LenderParticipation, Web';
        lenderParticipation.PartOf.Parts.push(lenderParticipation);

        this._facility.Create(
            facility,
            () => this.ComputeFacilities());
    }

    private ComputeFacilities(): void
    {
        if(!this._deal)
        {
            this._facilities = null;
            return;
        }

        this._facilities = <facilityAgreements.Facility[]>this._deal.Confers.filter(commitment => (<any>commitment).$type == 'Web.Model.Facility, Web');
    }
}
