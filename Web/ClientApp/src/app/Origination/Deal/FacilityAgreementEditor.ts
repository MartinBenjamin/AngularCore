import { Component, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, NEVER, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, sample, share, switchMap } from 'rxjs/operators';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { Store } from '../../EavStore/IEavStore';
import { ITransaction } from '../../EavStore/ITransactionManager';
import { FacilityAgreement } from '../../FacilityAgreements';

type ApplyCallback = () => void;

@Component(
    {
        selector: 'facility-agreement-editor',
        templateUrl: './FacilityAgreementEditor.html',
        providers:
            [
                ErrorsSubjectProvider,
                ErrorsObservableProvider,
                HighlightedPropertySubjectProvider,
                HighlightedPropertyObservableProvider
            ]
    })
export class FacilityAgreementEditor implements OnDestroy
{
    private _subscriptions     : Subscription[] = [];
    private _deal              : Deal;
    private _facilityAgreement = new BehaviorSubject<FacilityAgreement>(null);
    private _applyCallback     : ApplyCallback;
    private _transaction       : ITransaction;
    private _observeErrors     = new BehaviorSubject<boolean>(false);
    private _apply             = new Subject<void>();

    constructor(
        dealProvider          : DealProvider,
        @Inject(ErrorsSubjectToken)
        private _errorsService: Subject<Errors>,
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
                            this._facilityAgreement,
                            (errors, facilityAgreement) =>
                            {
                                if(!facilityAgreement)
                                    return null;

                                const facilityAgreementErrors = errors.get(facilityAgreement);
                                if(!facilityAgreementErrors)
                                    return null;

                                return new Map([[facilityAgreement, facilityAgreementErrors]]);
                            }).pipe(share());
                    }));

        this._subscriptions.push(
            dealProvider.subscribe(deal => this._deal = deal),
            errors.subscribe(
                errors => this._errorsService.next(errors && errors.size ? errors : null)),
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

    get FacilityAgreement(): Observable<FacilityAgreement>
    {
        return this._facilityAgreement;
    }

    Create(
        applyCallback: ApplyCallback
        )
    {
        this._applyCallback = applyCallback;
        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        store.SuspendPublish();
        let facilityAgreement = <FacilityAgreement>store.Assert(
            {
                Name   : '',
                Confers: [],
                $type  : 'Web.Model.FacilityAgreement, Web'
            });
        this._facilityAgreement.next(facilityAgreement);
        this._deal.Agreements.push(facilityAgreement);
        store.UnsuspendPublish();
    }

    Update(
        facilityAgreement: FacilityAgreement,
        applyCallback    : ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;
        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        this._facilityAgreement.next(facilityAgreement);
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
        this._observeErrors.next(false);
        this._facilityAgreement.next(null);
    }
}
