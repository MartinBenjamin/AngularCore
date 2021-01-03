import { Component, OnDestroy } from '@angular/core';
import { FacilityProvider } from '../FacilityProvider';
import { Subscription } from 'rxjs';
import { Facility } from '../FacilityAgreements';

@Component(
    {
        templateUrl: './FacilityTab1.html'
    })
export class FacilityTab1 implements OnDestroy
{
    private _subscriptions: Subscription[] = [];

    Facility: Facility;

    constructor(
        facilityProvider: FacilityProvider
        )
    {
        facilityProvider.subscribe(facility => this.Facility = facility);
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
