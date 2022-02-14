import { Component, forwardRef, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, NEVER, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, sample, share, switchMap } from 'rxjs/operators';
import { BranchesToken } from '../../BranchServiceProvider';
import { DomainObject, EmptyGuid, Guid } from '../../CommonDomainObjects';
import { ChangeDetector, Tab } from '../../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { CurrenciesOrderedByCodeToken } from '../../CurrencyServiceProvider';
import { FacilityTab } from '../../Deal/FacilityTab';
import { FacilityTab1 } from '../../Deal/FacilityTab1';
import { FacilityTab3 } from '../../Deal/FacilityTab3';
import { DealProvider } from '../../DealProvider';
import { Deal, DealRoleIdentifier } from '../../Deals';
import * as facilityAgreements from '../../FacilityAgreements';
import { LenderParticipation } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';
import { Currency } from '../../Iso4217';
import { Store } from '../../Ontology/IEavStore';
import { ITransaction } from '../../Ontology/ITransactionManager';
import { Branch } from '../../Organisations';
import { PartyInRole } from '../../Parties';
import { Alternative, Empty, IExpression, Property, Query2, Sequence, ZeroOrMore } from '../../RegularPathExpression';
import { Role } from '../../Roles';
import { RolesToken } from '../../RoleServiceProvider';
import { FacilityFees_s } from './FacilityFees_s';

type ApplyCallback = () => void;

@Component(
    {
        selector: 'facility-s',
        templateUrl: './Facility_s.html',
        providers:
            [
                {
                    provide: FacilityProvider,
                    useExisting: forwardRef(() => Facility_s)
                },
                ErrorsSubjectProvider,
                ErrorsObservableProvider,
                HighlightedPropertySubjectProvider,
                HighlightedPropertyObservableProvider
            ]
    })
export class Facility_s
    extends FacilityProvider
    implements OnDestroy
{
    private _subscriptions    : Subscription[] = [];
    private _bookingOfficeRole: Role;
    private _deal             : Deal;
    private _bookingOffice    : PartyInRole;
    private _applyCallback    : ApplyCallback;
    private _transaction      : ITransaction;
    private _observeErrors    = new BehaviorSubject<boolean>(false);
    private _apply            = new Subject<void>();

    private static _subgraph: IExpression = new Sequence(
        [
            new ZeroOrMore(new Property('Parts')),
            new Alternative(
            [
                Empty,
                new Property('Amount'),
                new Property('AccrualDate')
            ])
        ]);

    public static SubgraphQuery = Query2(Facility_s._subgraph);

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
                new Tab('Size &<br/>Dates'                , FacilityTab1  ),
                new Tab('Upfront &<br/>Participation Fees', FacilityFees_s),
                new Tab('Tab 3'                           , FacilityTab3  ),
                new Tab('Tab 4'                           , FacilityTab   )
            ];

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
                            this._facility,
                            (errors, facility) =>
                            {
                                if(!facility)
                                    return null;
                                const subgraph = new Set<any>(Facility_s.SubgraphQuery(facility));
                                return new Map([...errors.entries()].filter(([entity,]) => subgraph.has(entity)));
                            }).pipe(share());
                    }));

        this._subscriptions.push(
            roles.subscribe(roles => this._bookingOfficeRole = roles.find(role => role.Id == DealRoleIdentifier.BookingOffice)),
            dealProvider.subscribe(deal => this._deal = deal),
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

    get Facility(): Observable<facilityAgreements.Facility>
    {
        return this._facility;
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
        const facility = this._facility.getValue();
        let lenderParticipation = <facilityAgreements.LenderParticipation>facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
        if(this._bookingOffice)
        {
            lenderParticipation.Obligors.splice(
                lenderParticipation.Obligors.indexOf(this._bookingOffice),
                1);

            if(this._deal.Confers.every(commitment => !commitment.Obligors.includes(this._bookingOffice)))
                // Booking Office party no longer referenced.
                store.DeleteEntity(this._bookingOffice);
        }

        if(branch)
        {
            let bookingOffice = this._deal.Parties.find(
                party => party.Organisation.Id === branch.Id && party.Role.Id === this._bookingOfficeRole.Id);

            if(!bookingOffice)
            {
                bookingOffice = <PartyInRole>
                    {
                        Id             : EmptyGuid,
                        AutonomousAgent: branch,
                        Organisation   : branch,
                        Person         : null,
                        Role           : this._bookingOfficeRole,
                        Period         : null
                    };

                bookingOffice = <PartyInRole>store.Assert(bookingOffice);
            }

            lenderParticipation.Obligors.push(bookingOffice);
        }
        store.UnsuspendPublish();
        this.ComputeBookingOffice();
    }

    ComputeBookingOffice(): void
    {
        const facility = this._facility.getValue();
        let lenderParticipation = <facilityAgreements.LenderParticipation>facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
        this._bookingOffice = lenderParticipation.Obligors.find(obligor => obligor.Role.Id === DealRoleIdentifier.BookingOffice);
    }

    Create(
        applyCallback: ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;

        let facility = <facilityAgreements.Facility>
        {
            Name                     : '',
            Obligors                 : [],
            Contract                 : null,
            PartOf                   : null,
            Parts                    : [],
            Currency                 : null,
            Amount                   : null,
            AvailabilityPeriodEndDate: null,
            MaturityDate             : null,
            Expected1StDrawdownDate  : null,
            MultiCurrency            : null,
            Committed                : null
        };

        (<any>facility).$type = 'Web.Model.Facility, Web';

        let lenderParticipation = <LenderParticipation>
        {
            Obligors             : [],
            Contract             : null,
            PartOf               : facility,
            Parts                : [],
            Lender               : null,
            Amount               : null,
            UnderwriteAmount     : null,
            CreditSoughtLimit    : null,
            AnticipatedHoldAmount: null,
            ActualAllocation     : null
        };
        (<any>lenderParticipation).$type = 'Web.Model.LenderParticipation, Web';
        lenderParticipation.PartOf.Parts.push(lenderParticipation);

        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        store.SuspendPublish();
        facility = <facilityAgreements.Facility>store.Assert(facility);
        this._deal.Confers.push(
            facility,
            lenderParticipation);
        store.UnsuspendPublish();
        this._facility.next(facility);
        this.ComputeBookingOffice();
    }

    Update(
        facility     : facilityAgreements.Facility,
        applyCallback: ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;
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
