import { Component, Inject } from '@angular/core';
import { BehaviorSubject, combineLatest, NEVER, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, sample, share, switchMap } from 'rxjs/operators';
import { AccrualDate } from '../../Components/AccrualDate';
import { ToPrimitive } from '../../Components/Time';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { CurrenciesOrderedByCodeToken } from '../../CurrencyServiceProvider';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { FeeType } from '../../FacilityAgreements';
import { Fee } from '../../Fees';
import { Currency } from '../../Iso4217';
import { Store } from '../../Ontology/IEavStore';
import { ITransaction } from '../../Ontology/ITransactionManager';
import { Alternative, Empty, IExpression, Property, Query2 } from '../../RegularPathExpression';
import { DomainObject, Guid } from '../../CommonDomainObjects';

type ApplyCallback = () => void;

@Component(
    {
        selector: 'fee-editor',
        templateUrl: './FeeEditor.html',
        providers:
            [
                ErrorsSubjectProvider,
                ErrorsObservableProvider,
                HighlightedPropertySubjectProvider,
                HighlightedPropertyObservableProvider
            ]
    })
export class FeeEditor
{
    private _subscriptions : Subscription[] = [];
    private _deal          : Deal;
    private _fee           : Fee;
    private _feeObservable = new BehaviorSubject<Fee>(null);
    private _applyCallback : ApplyCallback;
    private _transaction   : ITransaction;
    private _observeErrors = new BehaviorSubject<boolean>(false);
    private _apply         = new Subject<void>();

    private static _subgraph: IExpression = new Alternative(
        [
            Empty,
            new Property('AccrualDate')
        ]);

    public static SubgraphQuery = Query2(FeeEditor._subgraph);

    constructor(
        @Inject(CurrenciesOrderedByCodeToken)
        private _currencies: Observable<Currency[]>,
        dealProvider: DealProvider,
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
                                const subgraph = new Set<any>(FeeEditor.SubgraphQuery(fee));
                                return new Map([...errors.entries()].filter(([entity,]) => subgraph.has(entity)));
                            }).pipe(share());
                    }));

        this._subscriptions.push(
            dealProvider.subscribe(deal => this._deal = deal),
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

    get Currencies(): Observable<Currency[]>
    {
        return this._currencies;
    }

    get Fee(): Fee
    {
        return this._fee;
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
                    [Symbol.toPrimitive]: ToPrimitive
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
                Type           : feeType,
                Received       : false,
                AccrualDate    : null,
                $type          : 'Web.Model.Fee, Web'
            });
        this._deal.Commitments.push(this._fee);
        store.UnsuspendPublish();
        this._feeObservable.next(this._fee);
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
        this._errorsService.next(null);
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
