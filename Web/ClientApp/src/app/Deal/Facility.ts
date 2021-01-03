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
                new Tab('Tab 1', FacilityTab1),
                new Tab('Tab 2', FacilityTab),
                new Tab('Tab 3', FacilityTab),
                new Tab('Tab 4', FacilityTab)
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
        this._facility.next(<facilityAgreements.Facility>this.CopyCommitment(this._originalFacility));
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

        this.Facility.Obligors.push(
            <PartyInRole>{
                Id             : EmptyGuid,
                AutonomousAgent: bookingOffice,
                Organisation   : bookingOffice,
                Person         : null,
                Role           : this._bookingOfficeRole,
                Period         : null
            });

        this.ComputeBookingOffice();
    }

    ComputeBookingOffice(): void
    {
        this._bookingOffice = this.Facility.Obligors.find(obligor => obligor.Role.Id === DealRoleIdentifier.BookingOffice);
    }

    Save(): void
    {
        let propertyService = new PropertyService();
        if(this._deal.Confers.indexOf(this._originalFacility) === -1)
            propertyService.Add(
                this._deal,
                this._facility,
                'Confers');
        else
        {

        }

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
        ): ContractualCommitment
    {
        let copy = <ContractualCommitment>{ ...commitment, PartOf: partOf };
        if(commitment.Parts)
            copy.Parts = commitment.Parts.map(
                part => this.CopyCommitment(
                    part,
                    copy));
        return copy;
    }
}
