import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Facility } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';

@Component(
    {
        templateUrl: './FacilityFees.html'
    })
export class FacilityFees implements OnDestroy
{
    private _subscriptions      : Subscription[] = [];
    private _facility           : Facility;

    constructor(
        facilityProvider: FacilityProvider
        )
    {
        this._subscriptions.push(
            facilityProvider.subscribe(
                facility =>
                {
                    this._facility = facility;
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
