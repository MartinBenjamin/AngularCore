import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Facility, LenderParticipation } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';

@Component(
    {
        templateUrl: './FacilityTab1.html'
    })
export class FacilityTab1 implements OnDestroy
{
    private _subscriptions      : Subscription[] = [];
    private _facility           : Facility;
    private _lenderParticipation: LenderParticipation;

    constructor(
        facilityProvider: FacilityProvider
        )
    {
        this._subscriptions.push(
            facilityProvider.subscribe(
                facility =>
                {
                    this._facility = facility;
                    if(!this._facility)
                        this._lenderParticipation = null;

                    else
                        this._lenderParticipation = this._facility.Parts.find((part): part is LenderParticipation => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Facility(): Facility
    {
        return this._facility;
    }

    get LenderParticipation(): LenderParticipation
    {
        return this._lenderParticipation;
    }

    get LenderShare(): number
    {
        if(this._facility && this._lenderParticipation)
            return this.LenderParticipationAmount * 100 / this._facility.Amount;

        return null;
    }

    private get LenderParticipationAmount(): number
    {
        if(this._lenderParticipation)
            return this._lenderParticipation.ActualAllocation !== null ? this._lenderParticipation.ActualAllocation : this._lenderParticipation.AnticipatedHoldAmount;

        return null;
    }
}
