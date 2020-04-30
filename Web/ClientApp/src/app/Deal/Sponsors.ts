import { Component, Inject, ViewChild, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { Deal, DealParty, DealRoleIdentifier, Sponsor, percentage } from '../Deals';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';
import { DealProvider } from '../DealProvider';
import { Sort } from '../Parties';

@Component(
    {
        selector: 'sponsors',
        templateUrl: './Sponsors.html'
    })
export class Sponsors implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _sponsorRole  : Role;
    private _deal         : Deal;
    private _sponsors     : Sponsor[];
    private _totalEquity  : number;

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
                    this._sponsorRole = roles.find(role => role.Id == DealRoleIdentifier.Sponsor);
                }),
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    this.ComputeSponsors();
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Initialised(): boolean
    {
        return this._sponsorRole != null;
    }

    get Sponsors(): Sponsor[]
    {
        return this._sponsors;
    }

    get TotalEquity(): number
    {
        return this._totalEquity;
    }

    Add(): void
    {
        this._legalEntityFinder.Find(
            legalEntity =>
            {
                if(this._sponsors.find(sponsor => sponsor.Organisation.Id == legalEntity.Id))
                {
                    alert(`${legalEntity.Name} is already a ${this._sponsorRole.Name}.`);
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
                        Role           : this._sponsorRole,
                        Period:
                        {
                            Start: today,
                            End  : null
                        },
                        Equity         : null
                    });

                this.ComputeSponsors();
            });
    }

    UpdateEquity(
        sponsor: Sponsor,
        equity : percentage
        ): void
    {
        sponsor.Equity = equity;
        this.ComputeTotalEquity();
    }

    private ComputeSponsors(): void
    {
        if(!this._deal)
        {
            this._sponsors = null;
            return;
        }

        this._sponsors = <Sponsor[]>this._deal.Parties
            .filter(party => party.Role.Id == DealRoleIdentifier.Sponsor)
            .sort(Sort);

        this.ComputeTotalEquity();
    }

    private ComputeTotalEquity()
    {
        this._totalEquity = this._sponsors
            .map(sponsor => sponsor.Equity)
            .reduce(
                (previousValue, currentValue) =>
                {
                    if(typeof currentValue != 'number' ||
                       !isFinite(currentValue))
                        return Number.NaN;

                    return previousValue + currentValue;
                },
                0);
    }
}
