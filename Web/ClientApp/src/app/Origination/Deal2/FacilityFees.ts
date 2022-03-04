import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClassificationScheme } from '../../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../../ClassificationSchemeServiceProvider';
import { Guid } from '../../CommonDomainObjects';
import { ClassificationSchemeIdentifier } from '../../Deals';
import { Facility, FeeType, LenderParticipation } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';
import { Fee } from '../../Fees';
import { IDomainObjectService } from '../../IDomainObjectService';
import { Group } from '../../Ontology/Group';
import { FacilityFeeEditor } from './FacilityFeeEditor';

@Component(
    {
        templateUrl: './FacilityFees.html'
    })
export class FacilityFees implements OnDestroy
{
    private _subscriptions      : Subscription[] = [];
    private _fees               : [FeeType, Fee[]][];
    private _feeTypes           : FeeType[];
    private _facility           : Facility;
    private _lenderParticipation: LenderParticipation;
    private _feeType            : FeeType;

    @ViewChild('editor', { static: true })
    private _editor: FacilityFeeEditor;

    constructor(
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>,
        facilityProvider: FacilityProvider
        )
    {
        this._subscriptions.push(
            classificationSchemeService
                .Get(ClassificationSchemeIdentifier.FacilityFeeType)
                .subscribe(
                    classificationScheme =>
                        this._feeTypes = classificationScheme
                            .Classifiers
                            .map(classificationSchemeClassifier => <FeeType>classificationSchemeClassifier.Classifier)
                            .sort((a, b) => a.Name.localeCompare(b.Name))),
            facilityProvider.subscribe(
                facility =>
                {
                    this._facility = facility;
                    this._feeType  = null;

                    if(!this._facility)
                        this._lenderParticipation = null;

                    else
                        this._lenderParticipation = this._facility.Parts.find<LenderParticipation>(
                            (part): part is LenderParticipation => (<any>part).$type === 'Web.Model.LenderParticipation, Web');

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

    get Fees(): [FeeType, Fee[]][]
    {
        return this._fees;
    }

    MonetaryAmount(
        fee: Fee
        ): number
    {
        let participation = this._lenderParticipation.ActualAllocation !== null ? this._lenderParticipation.ActualAllocation : this._lenderParticipation.AnticipatedHoldAmount;
        if(typeof participation === 'number' &&
           typeof fee.NumericValue === 'number')
            return fee.NumericValue * participation / 100;

        return null;
    }

    PercentageOfCommitment(
        fee: Fee
        ): number
    {
        let participation = this._lenderParticipation.ActualAllocation !== null ? this._lenderParticipation.ActualAllocation : this._lenderParticipation.AnticipatedHoldAmount;
        if(typeof participation === 'number' &&
           typeof fee.NumericValue === 'number')
            return fee.NumericValue * 100 / participation;

        return null;
    }

    Add(): void
    {
        this._editor.Create(
            this._feeType,
            () => this.ComputeFees());
    }

    Update(
        fee: Fee
        ): void
    {
        this._editor.Update(
            fee,
            () => this.ComputeFees());
    }

    Delete(
        fee: Fee
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

        this._fees = [...Group(
            this._facility.Parts.filter((part): part is Fee => (<any>part).$type == 'Web.Model.FacilityFee, Web'),
            fee => fee.Type,
            fee => fee)].sort((a, b) => a[0].Name.localeCompare(b[0].Name));
    }
}
