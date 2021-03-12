import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Facility, LenderParticipation } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';

@Component(
    {
        templateUrl: './FacilityTab3.html'
    })
export class FacilityTab3 implements OnDestroy
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
                        this._lenderParticipation = <LenderParticipation>this._facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
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
}
