import { Component, Inject } from '@angular/core';
import { BehaviorSubject, combineLatest, NEVER, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, sample, share, switchMap } from 'rxjs/operators';
import { AccrualDate } from '../../Components/AccrualDate';
import { ToPrimitive } from '../../Components/Time';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { Facility, FeeType, LenderParticipation } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';
import { FacilityFeeUnit, Fee } from '../../Fees';
import { Store } from '../../Ontology/IEavStore';
import { ITransaction } from '../../Ontology/ITransactionManager';
import { Alternative, Empty, IExpression, Property, Query2 } from '../../RegularPathExpression';

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
    private _subscriptions : Subscription[] = [];
    private _deal          : Deal;
    private _facility      : Facility;
    private _fee           : Fee;
    private _feeObservable = new BehaviorSubject<Fee>(null);
    private _applyCallback : ApplyCallback;
    private _transaction   : ITransaction;
    private _observeErrors = new BehaviorSubject<boolean>(false);
    private _apply         = new Subject<void>();
    private _participation : number;

    private static _subgraph: IExpression = new Alternative(
        [
            Empty,
            new Property('Amount'),
            new Property('AccrualDate')
        ]);

    public static SubgraphQuery = Query2(FacilityFeeEditor._subgraph);

    constructor(
        dealProvider: DealProvider,
        facilityProvider: FacilityProvider,
        @Inject(ErrorsSubjectToken)
        private _errorsService: Subject<Errors>
        )
    {
        const errors = combineLatest(
            dealProvider.ObserveErrors,
            this._observeErrors,
            (dealObserveErrors, observeErrors) => dealObserveErrors || observeErrors).pipe(
                distinctUntilChanged(),
                switchMap(
                    observeErrors =>
                    {
                        if(!observeErrors)
                            return NEVER;

                        return combineLatest(
                            dealProvider.Errors,
                            this._feeObservable,
                            (errors, fee) =>
                            {
                                if(!fee)
                                    return null;
                                const subgraph = new Set<any>(FacilityFeeEditor.SubgraphQuery(fee));
                                return new Map([...errors.entries()].filter(([entity,]) => subgraph.has(entity)));
                            }).pipe(share());
                    }));

        this._subscriptions.push(
            dealProvider.subscribe(deal => this._deal = deal),
            facilityProvider.subscribe(facility => this._facility = facility),
            errors.subscribe(errors => this._errorsService.next(errors && errors.size ? errors : null)),
            errors.pipe(
                sample(this._apply),
                filter(errors => !(errors && errors.size))).subscribe(
                    () =>
                    {
                        this._transaction.Commit();

                        if(this._applyCallback)
                            this._applyCallback();

                        this.Close();
                    }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Fee(): Fee
    {
        return this._fee;
    }

    get FacilityFeeUnit(): FacilityFeeUnit
    {
        return this._fee.MeasurementUnit === 0.01 ? FacilityFeeUnit.Percentage : FacilityFeeUnit.CommitmentCurrency;
    }

    set FacilityFeeUnit(
        facilityFeeUnit: FacilityFeeUnit
        )
    {
        // Facility Fees expressed as Committed Currency Units per 100 Currency Units of Commitment (% of Commitment)
        // is a quantity of dimension one (dimensionless quantity) which has a dimensionless Measurement Unit with a scalar value of 0.01.
        // https://www.iso.org/sites/JCGM/VIM/JCGM_200e_FILES/MAIN_JCGM_200e/01_e.html#L_1_8
        this._fee.MeasurementUnit = facilityFeeUnit === FacilityFeeUnit.Percentage ? 0.01 : null;

        // Trigger error update.
        this._feeObservable.next(this._fee);
    }

    get MonetaryAmount(): number
    {
        if(typeof this._participation === 'number' &&
           typeof this._fee.NumericValue === 'number')
            return this._fee.NumericValue * this._participation / 100;

        return null;
    }

    get PercentageOfCommitment(): number
    {
        if(typeof this._participation === 'number' &&
           typeof this._fee.NumericValue === 'number')
            return this._fee.NumericValue * 100 / this._participation;

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

        const store = Store(this._deal);
        store.SuspendPublish();
        if(accrued && !this._fee.AccrualDate)
            this._fee.AccrualDate = <AccrualDate>store.Assert(
                {
                    Day                 : 1,
                    [Symbol.toPrimitive]: ToPrimitive,
                    $type               : 'Web.Model.AccrualDate, Web'
                });

        else if(!accrued && this._fee.AccrualDate)
        {
            store.DeleteEntity(this._fee.AccrualDate);
            this._fee.AccrualDate = null;
        }
        store.UnsuspendPublish();
    }

    Create(
        feeType      : FeeType,
        applyCallback: ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;
        const store         = Store(this._deal);
        this._transaction   = store.BeginTransaction();
        store.SuspendPublish();
        this._fee = <Fee>store.Assert(
            {
                MeasurementUnit: null,
                PartOf         : this._facility,
                Type           : feeType,
                Received       : false,
                AccrualDate    : null,
                $type          : 'Web.Model.FacilityFee, Web'
            });
        this._fee.PartOf.Parts.push(this._fee);
        store.UnsuspendPublish();
        this._feeObservable.next(this._fee);
        this._participation = this.CalculateParticipation(this._facility);
    }

    Update(
        fee          : Fee,
        applyCallback: ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;
        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        this._fee = fee;
        this._feeObservable.next(this._fee);
        this._participation = this.CalculateParticipation(this._facility);
    }

    Apply(): void
    {
        this._observeErrors.next(true);
        this._apply.next();
    }

    Cancel(): void
    {
        this.Close();
        const store = Store(this._deal);
        store.SuspendPublish();
        this._transaction.Rollback();
        store.UnsuspendPublish();
    }

    Close(): void
    {
        this._fee = null;
        this._participation = null;
        this._observeErrors.next(false);
        this._feeObservable.next(this._fee);
        this._errorsService.next(null);
    }

    private CalculateParticipation(
        facility: Facility
        ): number
    {
        let lenderParticipation = facility.Parts.find((part): part is LenderParticipation => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
        return lenderParticipation.ActualAllocation !== null ? lenderParticipation.ActualAllocation : lenderParticipation.AnticipatedHoldAmount;
    }
}
