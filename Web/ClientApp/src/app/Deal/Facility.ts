import { Component, forwardRef, Inject, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { BranchesToken } from '../BranchServiceProvider';
import { DomainObject, EmptyGuid, Guid } from '../CommonDomainObjects';
import { ChangeDetector, Tab } from '../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../Components/ValidatedProperty';
import { ContractualCommitment } from '../Contracts';
import { CurrenciesOrderedByCodeToken } from '../CurrencyServiceProvider';
import { DealProvider } from '../DealProvider';
import { Deal, DealRoleIdentifier } from '../Deals';
import * as facilityAgreements from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { Currency } from '../Iso4217';
import { Validate } from '../Ontologies/Validate';
import { Branch } from '../Organisations';
import { PartyInRole } from '../Parties';
import { Alternative, Empty, IExpression, Property, Query, Sequence, ZeroOrMore } from '../RegularPathExpression';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';
import { FacilityFees } from './FacilityFees';
import { FacilityTab } from './FacilityTab';
import { FacilityTab1 } from './FacilityTab1';
import { FacilityTab3 } from './FacilityTab3';

enum PropertyAction
{
    Add    = 0,
    Remove = 1
}

interface IPropertyEvent
{
    Domain  : object;
    Range   : object;
    Property: string;
    Action  : PropertyAction;
}

interface IPropertyService
{
    Add(
        domain  : object,
        range   : object,
        property: string): void;

    Remove(
        domain  : object,
        range   : object,
        property: string): void;

    Events: Observable<IPropertyEvent>;
}

class PropertyService implements IPropertyService
{
    private _events = new Subject<IPropertyEvent>();
    Events = this._events.asObservable();

    Add(
        domain  : object,
        range   : object,
        property: string
        ): void
    {
        (<Array<object>>domain[property]).push(range);
        this._events.next(<IPropertyEvent>
            {
                Domain  : domain,
                Range   : range,
                Property: property,
                Action  : PropertyAction.Add
            });
    }

    Remove(
        domain  : object,
        range   : object,
        property: string
        ): void
    {
        let properties = (<Array<object>>domain[property]);
        properties.slice(
            properties.indexOf(range),
            1);
        this._events.next(<IPropertyEvent>
            {
                Domain  : domain,
                Range   : range,
                Property: property,
                Action  : PropertyAction.Remove
            });
    }
}

function Flatten(
    object  : object,
    objects?: Set<object>
    ): Set<object>
{
    objects = objects ? objects : new Set<object>();

    if(typeof object !== 'object' ||
        object === null ||
        object instanceof Date ||
        objects.has(object))
        return;

    objects.add(object);

    for(let propertyName in object)
        Flatten(
            object[propertyName],
            objects);

    return objects;
}

export function Copy(
    subgraph: Set<object>,
    copy    : Map<object, object>,
    object  : any
    ): any
{
    if(typeof object !== 'object' || object === null)
        return object;

    if(object instanceof Date)
        return new Date(object.valueOf());

    if(object instanceof Array)
        return object.map(element => Copy(
            subgraph,
            copy,
            element));

    if(subgraph.has(object))
    {
        let objectCopy = copy.get(object);
        if(objectCopy)
            return objectCopy;

        objectCopy = {};
        copy.set(
            object,
            objectCopy);

        for(let key in object)
            objectCopy[key] = Copy(
                subgraph,
                copy,
                object[key]);

        return objectCopy;
    }

    return object;
}

export function Update(
    subgraph: Set<object>,
    original: Map<object, object>,
    object  : any,
    updated?: Map<object, object>
    ): any
{
    updated = updated ? updated : new Map<object, object>();

    if(typeof object !== 'object' || object === null)
        return object;

    if(object instanceof Array)
        return object.map(element => Update(
            subgraph,
            original,
            element,
            updated));

    if(subgraph.has(object))
    {
        let objectToUpdate = updated.get(object);

        if(objectToUpdate)
            return objectToUpdate;

        objectToUpdate = original.get(object);
        if(!objectToUpdate)
            objectToUpdate = {};

        // Prevent infinite recursion.
        updated.set(
            object,
            objectToUpdate);

        for(let key in object)
            objectToUpdate[key] = Update(
                subgraph,
                original,
                object[key],
                updated);

        return objectToUpdate;
    }

    return object;
}

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
    private _subscriptions    : Subscription[] = [];
    private _bookingOfficeRole: Role;
    private _deal             : Deal;
    private _bookingOffice    : PartyInRole;
    private _copy             : Map<object, object>;
    private _applyCallback    : ApplyCallback;

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
            dealProvider.subscribe(deal => this._deal = deal));
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

    get Facility(): facilityAgreements.Facility
    {
        return this._facility.getValue();
    }

    get BookingOffice(): Branch
    {
        return this._bookingOffice ? <Branch>this._bookingOffice.Organisation : null;
    }

    set BookingOffice(
        branch: Branch
        )
    {
        let lenderParticipation = <facilityAgreements.LenderParticipation>this.Facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
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
        let lenderParticipation = <facilityAgreements.LenderParticipation>this.Facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
        this._bookingOffice = lenderParticipation.Obligors.find(obligor => obligor.Role.Id === DealRoleIdentifier.BookingOffice);
    }

    Create(
        facility     : facilityAgreements.Facility,
        applyCallback: ApplyCallback,
        )
    {
        this._applyCallback = applyCallback;
        this._facility.next(facility);
        this.ComputeBookingOffice();
    }

    Update(
        facility     : facilityAgreements.Facility,
        applyCallback: ApplyCallback,
        )
    {
        let subgraph = Query(
            facility,
            Facility._subgraph);

        this._applyCallback = applyCallback;
        this._copy = new Map<object, object>();
        this._facility.next(<facilityAgreements.Facility>Copy(
            subgraph,
            this._copy,
            facility));
        this.ComputeBookingOffice();
        this.Validate();
    }

    Apply(): void
    {
        let errors = this.Validate();

        if(errors.size)
            return;

        let before = new Set<ContractualCommitment>();
        let after  = new Set<ContractualCommitment>();
        if(this._copy)
        {
            let original = new Map<object, object>();
            this._copy.forEach(
                (value, key) => original.set(
                    value,
                    key));

            this.Flatten(
                <ContractualCommitment>original.get(this.Facility),
                before);

            let subgraph = Query(
                this.Facility,
                Facility._subgraph);

            Update(
                subgraph,
                original,
                this.Facility);

            this.Flatten(
                <ContractualCommitment>original.get(this.Facility),
                after);
        }
        else
            this.Flatten(
                this.Facility,
                after);

        [...before]
            .filter(commitment => !after.has(commitment))
            .forEach(
                commitment =>
                {
                    if(commitment.Contract)
                        commitment.Contract.Confers.splice(
                            commitment.Contract.Confers.indexOf(commitment),
                            1);

                    this._deal.Confers.splice(
                        this._deal.Confers.indexOf(commitment),
                        1);
                });

        [...after]
            .filter(commitment => !before.has(commitment))
            .forEach(
                commitment =>
                {
                    if(commitment.Contract)
                        commitment.Contract.Confers.push(commitment);

                    this._deal.Confers.push(commitment);
                });

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
        this._facility.next(null);
        this._copy          = null;
        this._bookingOffice = null;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }

    private Validate(): Map<object, Map<string, Set<keyof IErrors>>>
    {
        let classifications = this._deal.Ontology.Classify(this.Facility);
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

        // Detect changes in all Facility Tabs (and nested Tabs).
        this._changeDetector.DetectChanges();
        return errors;
    }

    private Flatten(
        commitment  : ContractualCommitment,
        commitments?: Set<ContractualCommitment>
        ): Set<ContractualCommitment>
    {
        commitments = commitments ? commitments : new Set<ContractualCommitment>();

        commitments.add(commitment);

        if(commitment.Parts)
            commitment.Parts.forEach(part => this.Flatten(
                part,
                commitments));

        return commitments;
    }
}
