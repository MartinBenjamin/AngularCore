import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Facility, FacilityFee, FeeType, LenderParticipation } from '../FacilityAgreements';
import { FacilityFeeTypesToken } from '../FacilityFeeTypeServiceProvider';
import { FacilityProvider } from '../FacilityProvider';
import { Group } from '../Ontology/Group';
import { FacilityFeeEditor } from './FacilityFeeEditor';

@Component(
    {
        templateUrl: './FacilityFees.html'
    })
export class FacilityFees implements OnDestroy
{
    private _subscriptions      : Subscription[] = [];
    private _fees               : Map<FeeType, FacilityFee[]>;
    private _feeTypes           : FeeType[];
    private _facility           : Facility;
    private _lenderParticipation: LenderParticipation;
    private _feeType            : FeeType;

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
                    this._feeType  = null;

                    if(!this._facility)
                        this._lenderParticipation = null;

                    else
                        this._lenderParticipation = <LenderParticipation>this._facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');


                    this.ComputeFees();
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

    get Fees(): Map<FeeType, FacilityFee[]>
    {
        return this._fees;
    }

    MonetaryAmount(
        fee: FacilityFee
        ): number
    {
        let participation = this._lenderParticipation.ActualAllocation !== null ? this._lenderParticipation.ActualAllocation : this._lenderParticipation.AnticipatedHoldAmount;
        if(typeof participation === 'number' &&
           typeof fee.Amount.Value === 'number')
            return fee.Amount.Value * participation / 100;

        return null;
    }

    PercentageOfCommitment(
        fee: FacilityFee
        ): number
    {
        let participation = this._lenderParticipation.ActualAllocation !== null ? this._lenderParticipation.ActualAllocation : this._lenderParticipation.AnticipatedHoldAmount;
        if(typeof participation === 'number' &&
           typeof fee.Amount.Value === 'number')
            return fee.Amount.Value * 100 / participation;

        return null;
    }

    Add(): void
    {
        this._editor.Create(
            this._feeType,
            () => this.ComputeFees());
    }

    Update(
        fee: FacilityFee
        ): void
    {
        this._editor.Update(
            fee,
            () => this.ComputeFees());
    }

    Delete(
        fee: FacilityFee
        ): void
    {
        this._facility.Parts.splice(
            this._facility.Parts.indexOf(fee),
            1);
        this.ComputeFees();
    }

    private ComputeFees(): void
    {
        if(!this._facility)
        {
            this._fees = null;
            return;
        }

        this._fees = Group(
            <FacilityFee[]>this._facility.Parts.filter(part => (<any>part).$type == 'Web.Model.FacilityFee, Web'),
            facilityFee => facilityFee.Type,
            facilityFee => facilityFee);
    }
}
