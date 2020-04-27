import { Component, Inject, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { Deal, DealParty, DealRoleIdentifier } from '../Deals';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';
import { DealProvider } from '../DealProvider';

@Component(
    {
        selector: 'borrowers',
        templateUrl: './Borrowers.html'
    })
export class Borrowers
{
    private _borrowerRole: Role;

    @ViewChild('legalEntityFinder')
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        @Inject(RolesToken)
        private _roles: Observable<Role[]>,
        private _dealProvider: DealProvider
        )
    {
        _roles.subscribe(
            roles =>
            {
                this._borrowerRole = roles.find(role => role.Id == DealRoleIdentifier.Borrower);
            });
    }

    get Initialised(): boolean
    {
        return this._borrowerRole != null;
    }

    get Deal(): Deal
    {
        return this._dealProvider.Deal;
    }

    Add(): void
    {
        this._legalEntityFinder.Find(
            legalEntity => this._dealProvider.Deal.Parties.push(
                <DealParty>{
                    Id             : EmptyGuid,
                    Deal           : this._dealProvider.Deal,
                    AutonomousAgent: legalEntity,
                    Organisation   : legalEntity,
                    Person         : null,
                    Role           : this._borrowerRole,
                    Period:
                    {
                        Start: new Date(Date.now()),
                        End: null
                    }
                }));
    }
}
