import { Component, forwardRef, Inject, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { BranchesToken } from '../../BranchServiceProvider';
import { DomainObject, EmptyGuid, Guid } from '../../CommonDomainObjects';
import { ChangeDetector, Tab } from '../../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { CurrenciesOrderedByCodeToken } from '../../CurrencyServiceProvider';
import { FacilityFees } from '../../Deal/FacilityFees';
import { FacilityTab } from '../../Deal/FacilityTab';
import { FacilityTab1 } from '../../Deal/FacilityTab1';
import { FacilityTab3 } from '../../Deal/FacilityTab3';
import { DealProvider } from '../../DealProvider';
import { Deal, DealRoleIdentifier } from '../../Deals';
import * as facilityAgreements from '../../FacilityAgreements';
import { LenderParticipation } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';
import { Currency } from '../../Iso4217';
import { LifeCycleStage } from '../../LifeCycles';
import { ObserveErrors } from '../../Ontologies/ObserveErrors';
import { IErrors } from '../../Ontologies/Validate';
import { Store } from '../../Ontology/IEavStore';
import { ITransaction } from '../../Ontology/ITransactionManager';
import { Branch } from '../../Organisations';
import { PartyInRole } from '../../Parties';
import { Alternative, Empty, IExpression, Property, Query2, Sequence, ZeroOrMore } from '../../RegularPathExpression';
import { Role } from '../../Roles';
import { RolesToken } from '../../RoleServiceProvider';

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
    private _errors           : Observable<Map<object, Map<string, Set<keyof IErrors>>>>;
    private _bookingOffice    : PartyInRole;
    private _applyCallback    : ApplyCallback;
    private _transaction      : ITransaction;
    private _errorsDetected   : boolean;

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
                new Tab('Size &<br/>Dates'                , FacilityTab1),
                new Tab('Upfront &<br/>Participation Fees', FacilityFees),
                new Tab('Tab 3'                           , FacilityTab3),
                new Tab('Tab 4'                           , FacilityTab )
            ];

        this._subscriptions.push(
            roles.subscribe(roles => this._bookingOfficeRole = roles.find(role => role.Id == DealRoleIdentifier.BookingOffice)),
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    if(!this._deal)
                        this._errors = null;

                    else
                    {
                        const store = Store(this._deal);
                        const applicableStages = store.ObserveAttribute('Stage').pipe(map(
                            (stages: [import('../../Deals').Deal, LifeCycleStage][]) =>
                            {
                                const [deal, stage] = stages[0];
                                const applicableStages = new Set<Guid>();
                                for(let lifeCycleStage of deal.LifeCycle.Stages)
                                {
                                    applicableStages.add(lifeCycleStage.Id);
                                    if(lifeCycleStage.Id === stage.Id)
                                        break;
                                }

                                return applicableStages;
                            }));

                        this._errors = ObserveErrors(
                            this._deal.Ontology,
                            store,
                            applicableStages).pipe(map(errors =>
                            {
                                const facility = this._facility.getValue();
                                const subgraph = new Set<any>(Facility_s.SubgraphQuery(facility));
                                return new Map([...errors.entries()].filter(([entity,]) => subgraph.has(entity)));
                            }))
                    }
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
        const facility = this._facility.getValue();
        let lenderParticipation = <facilityAgreements.LenderParticipation>facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
        if(this._bookingOffice)
            lenderParticipation.Obligors.splice(
                lenderParticipation.Obligors.indexOf(this._bookingOffice),
                1);

        if(branch)
        {

            let bookingOffice = this._deal.Parties.find(
                party => party.Organisation.Id === branch.Id && party.Role.Id === this._bookingOfficeRole.Id);

            if(!bookingOffice)
                bookingOffice = <PartyInRole>
                    {
                        Id             : EmptyGuid,
                        AutonomousAgent: branch,
                        Organisation   : branch,
                        Person         : null,
                        Role           : this._bookingOfficeRole,
                        Period         : null
                    };

            lenderParticipation.Obligors.push(bookingOffice);
        }

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
        this._errorsDetected = false;
        this._applyCallback = applyCallback;

        let facility = <facilityAgreements.Facility>
        {
            Name                     : '',
            Obligors                 : [],
            Contract                 : null,
            PartOf                   : null,
            Parts                    : [],
            Currency                 : null,
            TotalCommitments         : null,
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
        facility = <facilityAgreements.Facility>store.Add(facility);
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
        this._errorsDetected = false;
        this._applyCallback = applyCallback;
        const store = Store(this._deal);
        this._transaction = store.BeginTransaction();
        this._facility.next(facility);
        this.ComputeBookingOffice();

        this._errors.pipe(takeWhile(errors => errors.size > 0)).subscribe(
            {
                next: errors =>
                {
                    this._errorsService.next(errors.size ? errors : null);

                    // Detect changes in all Deal Tabs (and nested Tabs).
                    this._changeDetector.DetectChanges();

                    this._errorsDetected = true;
                },
                complete: () =>
                {
                    this._errorsService.next(null);

                    // Detect changes in all Deal Tabs (and nested Tabs).
                    this._changeDetector.DetectChanges();

                    this._errorsDetected = false;
                }
            });
    }

    Apply(): void
    {
        if(this._errorsDetected)
            return;

        this._errors.pipe(takeWhile(errors => errors.size > 0)).subscribe(
            {
                next: errors =>
                {
                    this._errorsService.next(errors.size ? errors : null);

                    // Detect changes in all Deal Tabs (and nested Tabs).
                    this._changeDetector.DetectChanges();

                    this._errorsDetected = true;
                },
                complete: () =>
                {
                    this._errorsService.next(null);

                    // Detect changes in all Deal Tabs (and nested Tabs).
                    this._changeDetector.DetectChanges();

                    if(!this._errorsDetected)
                    {
                        this._transaction.Commit();

                        if(this._applyCallback)
                            this._applyCallback();

                        this.Close();
                    }
                    else
                        this._errorsDetected = false;
                }
            });
    }

    Cancel(): void
    {
        this._transaction.Rollback();
        this.Close();
    }

    Close(): void
    {
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
