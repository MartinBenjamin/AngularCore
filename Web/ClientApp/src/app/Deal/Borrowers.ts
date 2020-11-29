import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal, DealParty, DealRoleIdentifier } from '../Deals';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { Sort } from '../Parties';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';

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
    private _errors        : object;

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
                    if(!deal)
                    {
                        this._deal = null;
                        this._errors = null;
                    }
                    else
                    {
                        this._deal = deal[0];
                        deal[1].subscribe(
                            errors =>
                            {
                                this._errors = null;
                                if(errors)
                                {
                                    let dealErrors = errors.get(this._deal);
                                    if(dealErrors)
                                    {
                                        this._errors = {};
                                        [...errors.get(this._deal)].forEach(propertyErrors => this._errors[propertyErrors[0]] = propertyErrors[1]);
                                    }
                                }
                            });
                    }

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

    get Errors(): object
    {
        return this._errors;
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

    private ComputeBorrowers(): void
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
