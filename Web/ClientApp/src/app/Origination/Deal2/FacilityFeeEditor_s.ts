import { Component, Inject } from '@angular/core';
import { BehaviorSubject, combineLatest, NEVER, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, sample, share, switchMap } from 'rxjs/operators';
import { AccrualDate } from '../../Components/AccrualDate';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { Facility, FacilityFee, FeeAmount, FeeAmountType, FeeType, LenderParticipation } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';
import { Store } from '../../Ontology/IEavStore';
import { ITransaction } from '../../Ontology/ITransactionManager';
import { Alternative, Empty, IExpression, Property, Query2 } from '../../RegularPathExpression';

type ApplyCallback = () => void;

@Component(
    {
        selector: 'facility-fee-editor-s',
        templateUrl: './FacilityFeeEditor_s.html',
        providers:
            [
                ErrorsSubjectProvider,
                ErrorsObservableProvider,
                HighlightedPropertySubjectProvider,
                HighlightedPropertyObservableProvider
            ]
    })
export class FacilityFeeEditor_s
{
    private _subscriptions : Subscription[] = [];
    private _deal          : Deal;
    private _facility      : Facility;
    private _fee           : FacilityFee;
    private _feeObservable = new BehaviorSubject<FacilityFee>(null);
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

    public static SubgraphQuery = Query2(FacilityFeeEditor_s._subgraph);

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
                                const subgraph = new Set<any>(FacilityFeeEditor_s.SubgraphQuery(fee));
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
        this._fee           = <FacilityFee>
        {
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
        (<any>this._fee.Amount).$type = 'Web.Model.FeeAmount, Web';

        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        store.SuspendPublish();
        this._fee = <FacilityFee>store.Assert(this._fee);
        this._fee.PartOf.Parts.push(this._fee);
        store.UnsuspendPublish();
        this._feeObservable.next(this._fee);
        this._participation = this.CalculateParticipation(this._facility);
    }

    Update(
        fee          : FacilityFee,
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
        this._observeErrors.next(false);
        this._feeObservable.next(this._fee);
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
