import { Component, Inject, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Facility, FeeType } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { FacilityFeeTypesToken } from '../FacilityFeeTypeServiceProvider';

@Component(
    {
        templateUrl: './FacilityFees.html'
    })
export class FacilityFees implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _feeTypes     : FeeType[];
    private _facility     : Facility;

    constructor(
        @Inject(FacilityFeeTypesToken)
        facilityFeeTypes: Observable<FeeType[]>,
        facilityProvider: FacilityProvider
        )
    {
        this._subscriptions.push(
            facilityFeeTypes.subscribe(feeTypes => this._feeTypes = feeTypes),
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
