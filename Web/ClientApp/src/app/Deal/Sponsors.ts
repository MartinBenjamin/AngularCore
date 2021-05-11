import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal, DealRoleIdentifier, percentage, Sponsor } from '../Deals';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { annotations } from '../Ontologies/Annotations';
import { IDealOntology } from '../Ontologies/IDealOntology';
import { Sort } from '../Parties';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';

@Component(
    {
        selector: 'sponsors',
        templateUrl: './Sponsors.html'
    })
export class Sponsors implements OnDestroy
{
    private _naEnabled    = false;
    private _subscriptions: Subscription[] = [];
    private _sponsorRole  : Role;
    private _deal         : Deal;
    private _sponsors     : Sponsor[];
    private _totalEquity  : number;

    @ViewChild('legalEntityFinder', { static: true })
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        @Inject(RolesToken)
        roles: Observable<Role[]>,
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(
            roles.subscribe(roles => this._sponsorRole = roles.find(role => role.Id == DealRoleIdentifier.Sponsor)),
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    if(deal)
                        this.Build(deal.Ontology);

                    this.ComputeSponsors();
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Deal(): Deal
    {
        return this._deal;
    }

    get NAEnabled(): boolean
    {
        return this._naEnabled;
    }

    get Initialised(): boolean
    {
        return this._sponsorRole != null;
    }

    get Sponsors(): Sponsor[]
    {
        return this._sponsors;
    }

    get NA(): boolean
    {
        return this._deal.SponsorsNA;
    }

    set NA(
        na: boolean
        )
    {
        this._deal.SponsorsNA = na;
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
                    <Sponsor>{
                        Id             : EmptyGuid,
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

    Delete(
        sponsor: Sponsor
        ): void
    {
        if(!confirm(`Delete ${this._sponsorRole.Name} ${sponsor.Organisation.Name}?`))
            return;

        this._deal.Parties.splice(
            this._deal.Parties.indexOf(sponsor),
            1);

        this.ComputeSponsors();
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

        if(this._sponsors.length > 0)
            this._deal.SponsorsNA = false;

        this.ComputeTotalEquity();
    }

    private ComputeTotalEquity()
    {
        this._totalEquity = this._sponsors
            .map(sponsor => sponsor.Equity)
            .reduce(
                (previousValue, currentValue) =>
                {
                    if(!(typeof currentValue == 'number' && isFinite(currentValue)))
                        return Number.NaN;

                    return previousValue + currentValue;
                },
                0);
    }

    Build(
        ontology: IDealOntology
        ): void
    {
        this.Reset();

        let superClasses = ontology.SuperClasses(ontology.Deal);
        for(let superClass of superClasses)
            for(let annotation of superClass.Annotations)
                if(annotation.Property == annotations.ComponentBuildAction &&
                    annotation.Value in this)
                    this[annotation.Value]();
    }

    Reset(): void
    {
        this._naEnabled = false;
    }

    AddSponsorsNA(): void
    {
        this._naEnabled = true;
    }
}
