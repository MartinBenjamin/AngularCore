import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Facility, LenderParticipation } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';

@Component(
    {
        templateUrl: './FacilityTab1.html'
    })
export class FacilityTab1 implements OnDestroy
{
    private _subscriptions: Subscription[] = [];

    Facility           : Facility;
    LenderParticipation: LenderParticipation;

    constructor(
        facilityProvider: FacilityProvider
        )
    {
        this._subscriptions.push(
            facilityProvider.subscribe(
                facility =>
                {
                    this.Facility = facility;
                    if(!this.Facility)
                        this.LenderParticipation = null;

                    else
                        this.LenderParticipation = <LenderParticipation>this.Facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get LenderShare(): number
    {
        if(this.Facility && this.LenderParticipation)
            return this.LenderParticipationAmount * 100 / this.Facility.TotalCommitments;

        return null;
    }

    private get LenderParticipationAmount(): number
    {
        if(this.LenderParticipation)
            return this.LenderParticipation.ActualAllocation !== null ? this.LenderParticipation.ActualAllocation : this.LenderParticipation.AnticipatedHoldAmount;

        return null;
    }
}
