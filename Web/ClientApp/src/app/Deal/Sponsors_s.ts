import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal, percentage, Sponsor } from '../Deals';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { annotations } from '../Ontologies/Annotations';
import { deals } from '../Ontologies/Deals';
import { IDealOntology } from '../Ontologies/IDealOntology';
import { roleIndividuals } from '../Ontologies/RoleIndividuals';
import { AddIndividual } from '../Ontology/AddIndividuals';
import { Store } from '../Ontology/IEavStore';
import { ObservableGenerator } from '../Ontology/ObservableGenerator';
import { Sort } from '../Parties';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';

@Component(
    {
        selector: 'sponsors-s',
        templateUrl: './Sponsors_s.html'
    })
export class Sponsors_s implements OnDestroy
{
    private _naEnabled    = false;
    private _subscriptions: Subscription[] = [];
    private _sponsorRole  : Role;
    private _deal         : Deal;
    private _sponsors     : Sponsor[];

    @ViewChild('legalEntityFinder', { static: true })
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    if(deal)
                    {
                        const store = Store(deal);
                        this._sponsorRole = <Role>AddIndividual(
                            deal.Ontology,
                            roleIndividuals.Sponsor,
                            store);
                        this.Build(deal.Ontology);

                        const generator = new ObservableGenerator(
                            deals,
                            store);

                        deals.SponsorParty.Select(generator).subscribe(
                            (sponsors: Set<Sponsor>) =>
                            {
                                this._sponsors = [...sponsors].sort(Sort);
                                if(this._sponsors.length > 0)
                                    this._deal.SponsorsNA = false;
                            });
                    }
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
                let sponsor = <Sponsor>{
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
                };

                sponsor = <Sponsor>Store(this._deal).Add(sponsor);
                this._deal.Parties.push(sponsor);
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

        Store(this._deal).DeleteEntity(sponsor);
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
