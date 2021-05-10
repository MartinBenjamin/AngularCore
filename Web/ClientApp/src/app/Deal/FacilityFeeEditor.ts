import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccrualDate } from '../AccrualDate';
import { EmptyGuid } from '../CommonDomainObjects';
import { Facility, FacilityFee, FeeAmount, FeeAmountType, FeeType, LenderParticipation } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { Alternative, Empty, IExpression, Property, Query } from '../RegularPathExpression';
import { Copy, Update } from './Facility';


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
    private _fee          : FacilityFee;
    private _copy         : Map<object, object>;
    private _applyCallback: ApplyCallback;
    private _participation: number;

    private static _subgraph: IExpression = new Alternative(
        [
            Empty,
            new Property('Amount'),
            new Property('AccrualDate')
        ]);

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
        this._copy          = null;
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

        let subgraph = Query(
            fee,
            FacilityFeeEditor._subgraph);

        this._copy = new Map<object, object>();
        this._fee = <FacilityFee>Copy(
            subgraph,
            this._copy,
            fee);

        this._participation = this.CalculateParticipation(this._facility);
    }

    Apply(): void
    {
        if(this._copy)
        {
            let original = new Map<object, object>();
            [...this._copy.entries()].forEach(
                entry => original.set(
                    entry[1],
                    entry[0]));

            let subgraph = Query(
                this._fee,
                FacilityFeeEditor._subgraph);

            Update(
                subgraph,
                original,
                this._fee);
        }
        else
            this._fee.PartOf.Parts.push(this._fee);

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
        this._fee           = null;
        this._participation = null;
    }

    private CalculateParticipation(
        facility: Facility
        ): number
    {
        let lenderParticipation = <LenderParticipation>facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
        return lenderParticipation.ActualAllocation !== null ? lenderParticipation.ActualAllocation : lenderParticipation.AnticipatedHoldAmount;
    }
}
