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

interface Copy<T>
{
    Original: T;
}

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
    private _originalFacility : facilityAgreements.Facility;
    private _bookingOffice    : PartyInRole;

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

                    this._originalFacility = null;
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

    set Facility(
        facility: facilityAgreements.Facility
        )
    {
        if(!facility)
            return;

        this._originalFacility = facility;
        this._facility.next(<facilityAgreements.Facility><unknown>this.CopyCommitment(this._originalFacility));
        this.ComputeBookingOffice();
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

    Save(): void
    {
        this.SynchroniseCommitment(
            this._originalFacility,
            <ContractualCommitment & Copy<ContractualCommitment>><unknown>this.Facility)

        this.Close();
    }

    Cancel(): void
    {
        this.Close();
    }

    Close(): void
    {
        this._facility.next(null);
        this._originalFacility = null;
        this._bookingOffice    = null;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }

    private CopyCommitment(
        commitment: ContractualCommitment,
        partOf   ?: ContractualCommitment
        ): ContractualCommitment & Copy<ContractualCommitment>
    {
        let copy = <ContractualCommitment & Copy<ContractualCommitment>>{ ...commitment, PartOf: partOf, Original: commitment };
        if(commitment.Parts)
            copy.Parts = commitment.Parts.map(
                part => this.CopyCommitment(
                    part,
                    copy));
        return copy;
    }

    private SynchroniseCommitment(
        original: ContractualCommitment,
        copy    : ContractualCommitment & Copy<ContractualCommitment>
        ): void
    {
        this.CreateUpdateCommitment(copy);
        this.DeleteCommitment(
            original,
            copy);
    }

    private CreateUpdateCommitment(
        commitment: ContractualCommitment & Copy<ContractualCommitment>
        )
    {
        if(!commitment.Original)
        {
            commitment.Original = <ContractualCommitment>
            {
                Id    : EmptyGuid,
                Parts : [],
                PartOf: commitment.PartOf ? (<ContractualCommitment & Copy<ContractualCommitment>>commitment.PartOf).Original : null
            };

            if(commitment.Original.PartOf)
                commitment.Original.PartOf.Parts.push(commitment.Original);

            if(commitment.Contract)
                commitment.Contract.Confers.push(commitment);
        }

        if(this._deal.Confers.indexOf(commitment) === -1)
            this._deal.Confers.push(commitment);

        for(let key in commitment)
            if(['Parts', 'PartOf'].indexOf(key) === -1)
                commitment.Original[key] = commitment[key];

        for(let part of commitment.Parts)
            this.CreateUpdateCommitment(<ContractualCommitment & Copy<ContractualCommitment>>part);
    }

    private DeleteCommitment(
        original: ContractualCommitment,
        copy    : ContractualCommitment
        )
    {
        for(let part of original.Parts)
        {
            let partCopy = null;
            if(copy)
                partCopy = copy.Parts.find(partCopy => (<ContractualCommitment & Copy<ContractualCommitment>>partCopy).Original === part)
            this.DeleteCommitment(
                part,
                partCopy);
        }

        if(!copy)
        {
            if(original.PartOf)
            {
                original.PartOf.Parts.splice(
                    original.PartOf.Parts.indexOf(original),
                    1);
            }

            this._deal.Confers.splice(
                this._deal.Confers.indexOf(original),
                1);
        }
    }
}
