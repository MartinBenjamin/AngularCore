import { Component, Inject, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { BranchesToken } from '../BranchServiceProvider';
import { DomainObject, EmptyGuid, Guid } from '../CommonDomainObjects';
import { ContractualCommitment } from '../Contracts';
import { CurrenciesOrderedByCodeToken } from '../CurrencyServiceProvider';
import { DealProvider } from '../DealProvider';
import { Deal, DealRoleIdentifier } from '../Deals';
import * as facilityAgreements from '../FacilityAgreements';
import { Currency } from '../Iso4217';
import { Branch } from '../Organisations';
import { PartyInRole } from '../Parties';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';

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
        templateUrl: './Facility.html'
    })
export class Facility implements OnDestroy
{
    private _subscriptions    : Subscription[] = [];
    private _bookingOfficeRole: Role;
    private _deal             : Deal;
    private _originalFacility : facilityAgreements.Facility;
    private _facility         : facilityAgreements.Facility;
    private _bookingOffice    : PartyInRole;

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
                    this._facility = null;
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
        return this._facility;
    }

    set Facility(
        facility: facilityAgreements.Facility
        )
    {
        if(!facility)
            return;

        this._originalFacility = facility;
        this._facility = <facilityAgreements.Facility>this.CopyCommitment(this._originalFacility);
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
            this._facility.Obligors.splice(
                this._facility.Obligors.indexOf(this._bookingOffice),
                1);

        this._facility.Obligors.push(
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
        this._bookingOffice = this._facility.Obligors.find(obligor => obligor.Role.Id === DealRoleIdentifier.BookingOffice);
    }

    Save(): void
    {
        let propertyService = new PropertyService();
        if(this._deal.Commitments.indexOf(this._originalFacility))
            propertyService.Add(
                this._deal,
                this._facility,
                'Commitments');
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
        this._originalFacility = null;
        this._facility         = null;
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
