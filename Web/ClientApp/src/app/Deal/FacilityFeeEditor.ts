import { Component, Inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AccrualDate } from '../AccrualDate';
import { EmptyGuid, Guid } from '../CommonDomainObjects';
import { ChangeDetector } from '../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../Components/ValidatedProperty';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import { Facility, FacilityFee, FeeAmount, FeeAmountType, FeeType, LenderParticipation } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { Validate } from '../Ontologies/Validate';
import { Alternative, Empty, IExpression, Property, Query } from '../RegularPathExpression';
import { Copy, Update } from './Facility';


type ApplyCallback = () => void;

@Component(
    {
        selector: 'facility-fee-editor',
        templateUrl: './FacilityFeeEditor.html',
        providers:
            [
                ErrorsSubjectProvider,
                ErrorsObservableProvider,
                HighlightedPropertySubjectProvider,
                HighlightedPropertyObservableProvider
            ]
    })
export class FacilityFeeEditor
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
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
        dealProvider: DealProvider,
        facilityProvider: FacilityProvider,
        @Inject(ErrorsSubjectToken)
        private _errorsService: Subject<Errors>
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(deal => this._deal = deal),
            facilityProvider.subscribe(facility => this._facility = facility));
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
        let subgraph = Query(
            this._fee,
            FacilityFeeEditor._subgraph);

        let classifications = this._deal.Ontology.ClassifyIndividuals(subgraph);
        let applicableStages = new Set<Guid>();
        for(let lifeCycleStage of this._deal.LifeCycle.Stages)
        {
            applicableStages.add(lifeCycleStage.Id);
            if(lifeCycleStage.Id === this._deal.Stage.Id)
                break;
        }

        let errors = Validate(
            this._deal.Ontology,
            classifications,
            applicableStages);

        this._errorsService.next(errors.size ? errors : null);

        if(errors.size)
            return;

        if(this._copy)
        {
            let original = new Map<object, object>();
            this._copy.forEach(
                (value, key) => original.set(
                    value,
                    key));

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
