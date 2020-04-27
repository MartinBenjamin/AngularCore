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
    private _deal        : Deal;

    @ViewChild('legalEntityFinder')
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        @Inject(RolesToken)
        roles: Observable<Role[]>,
        dealProvider: DealProvider
        )
    {
        roles.subscribe(
            roles =>
            {
                this._borrowerRole = roles.find(role => role.Id == DealRoleIdentifier.Borrower);
            });

        dealProvider.subscribe(deal => this._deal = deal);
    }

    get Initialised(): boolean
    {
        return this._borrowerRole != null && this._deal != null;
    }

    get Deal(): Deal
    {
        return this._deal;
    }

    Add(): void
    {
        this._legalEntityFinder.Find(
            legalEntity => this._deal.Parties.push(
                <DealParty>{
                    Id             : EmptyGuid,
                    Deal           : this._deal,
                    AutonomousAgent: legalEntity,
                    Organisation   : legalEntity,
                    Person         : null,
                    Role           : this._borrowerRole,
                    Period:
                    {
                        Start: new Date(Date.now()),
                        End  : null
                    }
                }));
    }
}
