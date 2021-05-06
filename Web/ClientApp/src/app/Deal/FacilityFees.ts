import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Facility, FeeType } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { FacilityFeeTypesToken } from '../FacilityFeeTypeServiceProvider';
import { FacilityFeeEditor } from './FacilityFeeEditor';

@Component(
    {
        templateUrl: './FacilityFees.html'
    })
export class FacilityFees implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _feeTypes     : FeeType[];
    private _facility     : Facility;
    private _feeType      : FeeType;

    @ViewChild('editor', { static: true })
    private _editor: FacilityFeeEditor;

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
                    this._feeType = null;
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get FeeTypes(): FeeType[]
    {
        return this._feeTypes;
    }

    get FeeType(): FeeType
    {
        return this._feeType;
    }

    set FeeType(
        feeType: FeeType
        )
    {
        this._feeType = feeType;
    }

    Add(): void
    {
        this._editor.Create(
            this._feeType,
            () => { });
    }
}
