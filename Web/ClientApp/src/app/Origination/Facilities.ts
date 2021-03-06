import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { ContractualCommitment } from '../Contracts';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { Facility, LenderParticipation } from '../FacilityAgreements';

@Component(
    {
        selector: 'facilities',
        templateUrl: './Facilities.html'
    })
export class Facilities implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _facilities   : [Facility, LenderParticipation][]

    @ViewChild('facility', { static: true })
    private _facility: import('../Deal/Facility').Facility;

    constructor(
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(deal => this._deal = deal));
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    this.ComputeFacilities();
                }));

    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Facilities(): [Facility, LenderParticipation][]
    {
        return this._facilities;
    }

    Add(): void
    {
        let facility = <Facility>
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

        let lenderParticipation = <LenderParticipation>
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

    Update(
        facility: Facility
        ): void
    {
        this._facility.Update(
            facility,
            () => this.ComputeFacilities());
    }

    Delete(
        facility: Facility
        ): void
    {
        if(confirm(`Delete Facility ${facility.Name}?`))
        {
            this._deal.Confers.splice(
                this._deal.Confers.indexOf(facility),
                1);

            this.ComputeFacilities();
        }
    }

    private ComputeFacilities(): void
    {
        if(!this._deal)
        {
            this._facilities = null;
            return;
        }

        this._facilities = this._deal.Confers
            .filter(commitment => (<any>commitment).$type == 'Web.Model.Facility, Web')
            .map(commitment => <[Facility, LenderParticipation]>
                [
                    commitment,
                    (<ContractualCommitment>commitment).Parts.find(commitment => (<any>commitment).$type == 'Web.Model.LenderParticipation, Web')
                ]);
    }
}
