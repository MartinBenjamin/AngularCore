import { Component, Inject, OnDestroy, forwardRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { BranchesToken } from '../BranchServiceProvider';
import { DomainObject, EmptyGuid, Guid } from '../CommonDomainObjects';
import { Tab } from '../Components/TabbedView';
import { ContractualCommitment } from '../Contracts';
import { CurrenciesOrderedByCodeToken } from '../CurrencyServiceProvider';
import { DealProvider } from '../DealProvider';
import { Deal, DealRoleIdentifier } from '../Deals';
import * as facilityAgreements from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { Currency } from '../Iso4217';
import { Branch } from '../Organisations';
import { PartyInRole } from '../Parties';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';
import { FacilityTab } from './FacilityTab';
import { FacilityTab1 } from './FacilityTab1';

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

    if(typeof object !== "object" ||
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

function Copy(
    copy  : Map<object, object>,
    object: any
    ): any
{
    if(typeof object !== "object" || object === null )
        return object;

    let objectCopy = copy.get(object);
    if(objectCopy)
        return objectCopy;

    if(object instanceof Date)
        return new Date(object.valueOf());

    if(object instanceof Array)
        return object.map(element => Copy(
            copy,
            element));

    objectCopy = {};
    copy.set(
        object,
        objectCopy);

    for(let key in object)
        objectCopy[key] = Copy(
            copy,
            object[key]);
}

function Update(
    original: Map<object, object>,
    copy    : any,
    updated?: Map<object, object>
    ): any
{
    updated = updated ? updated : new Map<object, object>();

    if(typeof copy !== "object"
        || copy === null
        || copy instanceof Date)
        return copy;

    if(copy instanceof Array)
        return copy.map(element => Update(
            original,
            element,
            updated));

    let object = updated.get(copy);

    if(object)
        return object;

    object = original.get(copy);
    if(!object)
    {
        object = {};
        original.set(
            copy,
            original);
    }

    // Prevent infinite recursion.
    updated.set(
        copy,
        object);

    for(let key in copy)
        object[key] = Update(
            original,
            copy[key],
            updated);

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
                }
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

    public Tabs: Tab[];

    constructor(
        @Inject(RolesToken)
        roles              : Observable<Role[]>,
        @Inject(CurrenciesOrderedByCodeToken)
        private _currencies: Observable<Currency[]>,
        @Inject(BranchesToken)
        private _branches  : Observable<Branch[]>,
        dealProvider       : DealProvider
        )
    {
        super();

        this.Tabs =
            [
                new Tab('Size &<br/>Dates', FacilityTab1),
                new Tab('Tab 2'           , FacilityTab),
                new Tab('Tab 3'           , FacilityTab),
                new Tab('Tab 4'           , FacilityTab)
            ];

        this._subscriptions.push(
            roles.subscribe(roles => this._bookingOfficeRole = roles.find(role => role.Id == DealRoleIdentifier.BookingOffice)),
            dealProvider.subscribe(
                deal =>
                {
                    if(!deal)
                        this._deal = null;

                    else
                        this._deal = deal[0];

                    this._copy = null;
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

    get Facility(): facilityAgreements.Facility
    {
        return this._facility.getValue();
    }

    get BookingOffice(): Branch
    {
        return this._bookingOffice ? <Branch>this._bookingOffice.Organisation : null;
    }

    set BookingOffice(
        bookingOffice: Branch
        )
    {
        if(this._bookingOffice)
            this.Facility.Obligors.splice(
                this.Facility.Obligors.indexOf(this._bookingOffice),
                1);

        let bookingOfficeParty = this._deal.Parties.find(
            party => party.Organisation.Id === bookingOffice.Id && party.Role.Id === this._bookingOfficeRole.Id);

        if(!bookingOfficeParty)
            bookingOfficeParty = <PartyInRole>
                {
                    Id             : EmptyGuid,
                    AutonomousAgent: bookingOffice,
                    Organisation   : bookingOffice,
                    Person         : null,
                    Role           : this._bookingOfficeRole,
                    Period         : null
                };

        this.Facility.Obligors.push(bookingOfficeParty);
        this.ComputeBookingOffice();
    }

    ComputeBookingOffice(): void
    {
        this._bookingOffice = this.Facility.Obligors.find(obligor => obligor.Role.Id === DealRoleIdentifier.BookingOffice);
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
        this._applyCallback = applyCallback;
        this._copy = new Map<object, object>();
        this._facility.next(<facilityAgreements.Facility>Copy(
            this._copy,
            facility));
        this.ComputeBookingOffice();
    }

    Apply(): void
    {
        let before = new Set<ContractualCommitment>();
        let after  = new Set<ContractualCommitment>();
        if(this._copy)
        {
            this.Flatten(
                <ContractualCommitment>this._copy.get(this.Facility),
                before);

            let original = new Map<object, object>();
            [...this._copy.entries()].forEach(
                entry => original.set(
                    entry[1],
                    entry[0]));

            Update(
                original,
                this.Facility);

            this.Flatten(<
                ContractualCommitment>this._copy.get(this.Facility),
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

    Flatten(
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
