import { Component, Inject, ViewChild, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { Deal, DealParty, DealRoleIdentifier } from '../Deals';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';
import { DealProvider } from '../DealProvider';
import { Sort } from '../Parties';

@Component(
    {
        selector: 'borrowers',
        templateUrl: './Borrowers.html'
    })
export class Borrowers implements OnDestroy
{
    private _subscriptions : Subscription[] = [];
    private _borrowerRole  : Role;
    private _deal          : Deal;
    private _borrowers     : DealParty[];

    @ViewChild('legalEntityFinder')
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        @Inject(RolesToken)
        roles: Observable<Role[]>,
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(
            roles.subscribe(
                roles =>
                {
                    this._borrowerRole = roles.find(role => role.Id == DealRoleIdentifier.Borrower);
                }),
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    this.ComputeBorrowers();
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Initialised(): boolean
    {
        return this._borrowerRole != null;
    }

    get Borrowers(): DealParty[]
    {
        return this._borrowers;
    }

    Add(): void
    {
        this._legalEntityFinder.Find(
            legalEntity =>
            {
                if(this._borrowers.find(borrower => borrower.Organisation.Id == legalEntity.Id))
                {
                    alert(`${legalEntity.Name} is already a ${this._borrowerRole.Name}.`);
                    return;
                }

                let today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                this._deal.Parties.push(
                    <DealParty>{
                        Id             : EmptyGuid,
                        Deal           : this._deal,
                        AutonomousAgent: legalEntity,
                        Organisation   : legalEntity,
                        Person         : null,
                        Role           : this._borrowerRole,
                        Period:
                        {
                            Start: today,
                            End  : null
                        }
                    });

                this.ComputeBorrowers();
            });
    }

    ComputeBorrowers(): void
    {
        if(!this._deal)
        {
            this._borrowers = null;
            return;
        }

        this._borrowers = this._deal.Parties
            .filter(party => party.Role.Id == DealRoleIdentifier.Borrower)
            .sort(Sort);
    }
}
