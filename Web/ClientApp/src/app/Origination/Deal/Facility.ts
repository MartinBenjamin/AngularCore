import { Component, forwardRef, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, NEVER, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, sample, share, switchMap } from 'rxjs/operators';
import { BranchesToken } from '../../BranchServiceProvider';
import { DomainObject, Guid } from '../../CommonDomainObjects';
import { ChangeDetector, Tab } from '../../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { CurrenciesOrderedByCodeToken } from '../../CurrencyServiceProvider';
import { DealProvider } from '../../DealProvider';
import { Deal, DealRoleIdentifier } from '../../Deals';
import { Store } from '../../EavStore/IEavStore';
import { ITransaction } from '../../EavStore/ITransactionManager';
import * as facilityAgreements from '../../FacilityAgreements';
import { FacilityAgreement, FacilityType, LenderParticipation } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';
import { Currency } from '../../Iso4217';
import { Branch } from '../../Organisations';
import { Alternative, Empty, IExpression, Property, Query2, Sequence, ZeroOrMore } from '../../RegularPathExpression';
import { Role } from '../../Roles';
import { RolesToken } from '../../RoleServiceProvider';
import { FacilityFees } from './FacilityFees';
import { FacilityTab } from './FacilityTab';
import { FacilityTab1 } from './FacilityTab1';
import { FacilityTab3 } from './FacilityTab3';

type ApplyCallback = () => void;

@Component(
    {
        selector: 'facility',
        templateUrl: './Facility.html',
        providers:
            [
                {
                    provide: FacilityProvider,
                    useExisting: forwardRef(() => Facility)
                },
                ErrorsSubjectProvider,
                ErrorsObservableProvider,
                HighlightedPropertySubjectProvider,
                HighlightedPropertyObservableProvider
            ]
    })
export class Facility
    extends FacilityProvider
    implements OnDestroy
{
    private _subscriptions      : Subscription[] = [];
    private _bookingOfficeRole  : Role;
    private _deal               : Deal;
    private _agreements         : FacilityAgreement[];
    private _lenderParticipation: LenderParticipation;
    private _bookingOffice      : facilityAgreements.BookingOffice;
    private _applyCallback      : ApplyCallback;
    private _transaction        : ITransaction;
    private _observeErrors      = new BehaviorSubject<boolean>(false);
    private _apply              = new Subject<void>();

    private static _subgraph: IExpression = new Sequence(
        [
            new ZeroOrMore(new Property('Parts')),
            new Alternative(
            [
                Empty,
                new Property('AccrualDate')
            ])
        ]);

    public static SubgraphQuery = Query2(Facility._subgraph);

    public Tabs: Tab[];

    constructor(
        @Inject(RolesToken)
        roles                  : Observable<Role[]>,
        @Inject(CurrenciesOrderedByCodeToken)
        private _currencies    : Observable<Currency[]>,
        @Inject(BranchesToken)
        private _branches      : Observable<Branch[]>,
        dealProvider           : DealProvider,
        @Inject(ErrorsSubjectToken)
        private _errorsService : Subject<Errors>,
        private _changeDetector: ChangeDetector
        )
    {
        super();

        this.Tabs =
            [
                new Tab('Size &<br/>Dates'                , FacilityTab1),
                new Tab('Upfront &<br/>Participation Fees', FacilityFees),
                new Tab('Tab 3'                           , FacilityTab3),
                new Tab('Tab 4'                           , FacilityTab )
            ];

        const errors = combineLatest(
            dealProvider.ObserveErrors,
            this._observeErrors,
            (dealObserveErrors, observeErrors) => dealObserveErrors || observeErrors).pipe(
                distinctUntilChanged(),
                switchMap(
                    observeErrors => !observeErrors ? NEVER : combineLatest(
                        dealProvider.Errors,
                        this._facility,
                        (errors, facility) =>
                        {
                            if(!facility)
                                return null;
                            const subgraph = new Set<any>(Facility.SubgraphQuery(facility));
                            return new Map([...errors.entries()].filter(([entity,]) => subgraph.has(entity)));
                        }).pipe(share())));

        this._subscriptions.push(
            roles.subscribe(roles => this._bookingOfficeRole = roles.find(role => role.Id == DealRoleIdentifier.BookingOffice)),
            dealProvider.subscribe(deal => this._deal = deal),
            this.pipe(
                map(facility =>
                    facility ? facility.Parts.find((part): part is LenderParticipation => (<any>part).$type === 'Web.Model.LenderParticipation, Web') : null)
                ).subscribe(lenderParticipation => this._lenderParticipation = lenderParticipation),
            errors.subscribe(
                errors =>
                {
                    this._errorsService.next(errors && errors.size ? errors : null);

                    // Detect changes in all Deal Tabs (and nested Tabs).
                    this._changeDetector.DetectChanges();
                }),
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

    get Branches(): Observable<Branch[]>
    {
        return this._branches;
    }

    get Agreements(): FacilityAgreement[]
    {
        return this._agreements;
    }

    get Facility(): Observable<facilityAgreements.Facility>
    {
        return this._facility;
    }

    get Agreement(): FacilityAgreement
    {
        return this._facility.getValue().ConferredBy;
    }

    set Agreement(
        agreement: FacilityAgreement
        )
    {
        const facility = this._facility.getValue();
        if(facility.ConferredBy)
            facility.ConferredBy.Confers.splice(
                facility.ConferredBy.Confers.indexOf(facility),
                1);

        facility.ConferredBy = agreement;
        agreement.Confers.push(agreement);
    }

    get BookingOffice(): Branch
    {
        return this._bookingOffice ? <Branch>this._bookingOffice.Organisation : null;
    }

    set BookingOffice(
        branch: Branch
        )
    {
        const store = Store(this._deal);
        store.SuspendPublish();
        if(this._bookingOffice)
        {
            this._lenderParticipation.Obligors.splice(
                this._lenderParticipation.Obligors.indexOf(this._bookingOffice),
                1);
            store.DeleteEntity(this._bookingOffice);
        }

        if(branch)
        {
            const bookingOffice = <facilityAgreements.BookingOffice>store.Assert(
                {
                    Organisation: branch,
                    Role        : this._bookingOfficeRole,
                    Period      : null
                });

            this._lenderParticipation.Obligors.push(bookingOffice);
        }

        store.UnsuspendPublish();
        this.ComputeBookingOffice();
    }

    ComputeBookingOffice(): void
    {
        this._bookingOffice = this._lenderParticipation.Obligors.find(obligor => obligor.Role.Id === DealRoleIdentifier.BookingOffice);
    }

    Create(
        facilityType : FacilityType,
        applyCallback: ApplyCallback
        )
    {
        this._applyCallback = applyCallback;
        this._agreements = this._deal.Agreements
            .filter((agreement): agreement is FacilityAgreement => (<any>agreement).$type === 'Web.Model.FacilityAgreement, Web');

        let facility = <facilityAgreements.Facility>
        {
            Type    : facilityType,
            Obligors: [],
            Parts   : []
        };

        (<any>facility).$type = 'Web.Model.Facility, Web';

        let lenderParticipation = <LenderParticipation>
        {
            Obligors: [],
            PartOf  : facility,
            Parts   : []
        };
        (<any>lenderParticipation).$type = 'Web.Model.LenderParticipation, Web';
        lenderParticipation.PartOf.Parts.push(lenderParticipation);

        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        store.SuspendPublish();
        facility = <facilityAgreements.Facility>store.Assert(facility);
        this._deal.Commitments.push(facility);
        this._deal.Commitments.push(...facility.Parts);

        if(!this._agreements.length)
        {
            const facilityAgreement = <FacilityAgreement>store.Assert(
                {
                    Name   : 'Facility Agreement',
                    Confers: [],
                    $type  : 'Web.Model.FacilityAgreement, Web'
                });
            this._agreements.push(facilityAgreement);
            this._deal.Agreements.push(facilityAgreement);
        }

        if(this._agreements.length === 1)
        {
            const agreement = this._agreements[0];
            facility.ConferredBy = agreement;
            agreement.Confers.push(facility);
        }

        store.UnsuspendPublish();
        this._facility.next(facility);
        this.ComputeBookingOffice();
    }

    Update(
        facility     : facilityAgreements.Facility,
        applyCallback: ApplyCallback
        )
    {
        this._applyCallback = applyCallback;
        this._agreements = this._deal.Agreements
            .filter((agreement): agreement is FacilityAgreement => (<any>agreement).$type === 'Web.Model.FacilityAgreement, Web');
        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        this._facility.next(facility);
        this.ComputeBookingOffice();
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
        this._facility.next(null);
        this._bookingOffice = null;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
