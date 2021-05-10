import { Component, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ContractualCommitment } from '../Contracts';
import { Query, Empty, IExpression, Alternative, Sequence, Any, ZeroOrOne, Property } from '../RegularPathExpression';
import { Facility, FacilityFee, FeeType, FeeAmount, FeeAmountType, LenderParticipation } from '../FacilityAgreements';
import { EmptyGuid } from '../CommonDomainObjects';
import { FacilityProvider } from '../FacilityProvider';
import { AccrualDate } from '../AccrualDate';


type ApplyCallback = () => void;

@Component(
    {
        selector: 'facility-fee-editor',
        templateUrl: './FacilityFeeEditor.html'
    })
export class FacilityFeeEditor
{
    private _subscriptions: Subscription[] = [];
    private _facility     : Facility;
    private _originalFee  : FacilityFee;
    private _fee          : FacilityFee;
    private _applyCallback: ApplyCallback;
    private _participation: number;

    private static _subgraph: IExpression = new ZeroOrOne(new Property('Amount'));

    constructor(
        facilityProvider: FacilityProvider
        )
    {
        this._subscriptions.push(facilityProvider.subscribe(facility => this._facility = facility));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Fee(): FacilityFee
    {
        return this._fee;
    }

    get MonetaryAmount(): number
    {
        if(typeof this._participation === 'number' &&
           typeof this._fee.Amount.Value === 'number')
            return this._fee.Amount.Value * this._participation / 100;

        return null;
    }

    get PercentageOfCommitment(): number
    {
        if(typeof this._participation === 'number' &&
           typeof this._fee.Amount.Value === 'number')
            return this._fee.Amount.Value * 100 / this._participation;

        return null;
    }

    get Accrued(): boolean
    {
        return this._fee && this._fee.AccrualDate !== null;
    }

    set Accrued(
        accrued: boolean
        )
    {
        if(!this._fee)
            return;

        if(accrued && !this._fee.AccrualDate)
            this._fee.AccrualDate = <AccrualDate>
                {
                    Year : null,
                    Month: null
                };

        else if(!accrued && this._fee.AccrualDate)
            this._fee.AccrualDate = null;
    }

    Create(
        feeType      : FeeType,
        applyCallback: ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;
        this._originalFee   = null;
        this._fee           = <FacilityFee>
        {
            Id                  : EmptyGuid,
            PartOf              : this._facility,
            Type                : feeType,
            Amount              : <FeeAmount>
            {
                Type : FeeAmountType.MonetaryAmount,
                Value: null
            },
            ExpectedReceivedDate: null,
            Received            : false,
            AccrualDate         : null
        };

        (<any>this._fee).$type = 'Web.Model.FacilityFee, Web';
        this._participation = this.CalculateParticipation(this._facility);
    }

    Update(
        fee          : FacilityFee,
        applyCallback: ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;
        this._originalFee   = fee;
        this._fee           = <FacilityFee>{};
        for(let key in fee)
        {
            let value = fee[key];
            this._fee[key] = value instanceof Date ? new Date(value.valueOf()) : value;
        }

        this._fee.Amount = <FeeAmount>{ ...this._fee.Amount };

        if(this._fee.AccrualDate)
            this._fee.AccrualDate = <AccrualDate>{ ...this._fee.AccrualDate };

        this._participation = this.CalculateParticipation(this._facility);
    }

    Apply(): void
    {
        if(!this._originalFee)
            this._fee.PartOf.Parts.push(this._fee);

        else for(let key in this._fee)
            this._originalFee[key] = this._fee[key];

        if(this._applyCallback)
            this._applyCallback();

        this.Close();
    }

    Cancel(): void
    {
        this.Close();
    }

    Close(): void
    {
        this._originalFee   = null;
        this._fee           = null;
        this._participation = null;
    }

    private CalculateParticipation(
        facility: Facility): number
    {
        let lenderParticipation = <LenderParticipation>facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
        return lenderParticipation.ActualAllocation !== null ? lenderParticipation.ActualAllocation : lenderParticipation.AnticipatedHoldAmount;
    }
}
