import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { NEVER, Observable, Subscription } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Classifier } from '../../ClassificationScheme';
import { Guid } from "../../CommonDomainObjects";
import { DealProvider } from '../../DealProvider';
import { Deal, Sponsor } from '../../Deals';
import { Store } from '../../EavStore/IEavStore';
import { IDomainObjectService } from "../../IDomainObjectService";
import { LegalEntityFinder } from '../../LegalEntityFinder';
import { annotations } from '../../Ontologies/Annotations';
import { deals } from '../../Ontologies/Deals';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { roleIndividuals } from '../../Ontologies/RoleIndividuals';
import { AddIndividual } from '../../Ontology/AddIndividuals';
import { ClassExpressionObservableInterpreter } from '../../Ontology/ClassExpressionObservableInterpreter';
import { Sort } from '../../Parties';
import { Role } from '../../Roles';
import { RoleServiceToken } from "../../RoleServiceProvider";

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
    private _notSponsored : Classifier;
    private _deal         : Deal;
    private _sponsors     : Observable<Sponsor[]>;

    @ViewChild('legalEntityFinder', { static: true })
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        @Inject(RoleServiceToken)
        roleService: IDomainObjectService<Guid, Role>,
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
                        this._notSponsored = <Classifier>AddIndividual(
                            deal.Ontology,
                            deals.NotSponsoredClassifier,
                            store);
                        roleService.Get(this._sponsorRole.Id).subscribe(sponsorRole => store.Assert(sponsorRole));
                        this.Build(deal.Ontology);
                    }
                }));

        this._sponsors = dealProvider.pipe(
            switchMap(
                deal =>
                {
                    if(!deal)
                        return NEVER;

                    const store = Store(deal);
                    const interpreter = new ClassExpressionObservableInterpreter(
                        deals,
                        store);

                    return deals.SponsorParty.Select(interpreter).pipe(map(sponsors => [...sponsors].sort(Sort)));
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

    get Sponsors(): Observable<Sponsor[]>
    {
        return this._sponsors;
    }

    get NA(): boolean
    {
        return this._deal.Classifiers.indexOf(this._notSponsored) !== -1;
    }

    set NA(
        na: boolean
        )
    {
        const index = this._deal.Classifiers.indexOf(this._notSponsored);
        if(index === -1 && na)
            this._deal.Classifiers.push(this._notSponsored);

        else if(index !== -1 && !na)
            this._deal.Classifiers.splice(
                index,
                1);
    }

    Add(): void
    {
        this._legalEntityFinder.Find(
            legalEntity =>
            {
                let currentSponsors: Sponsor[];
                this._sponsors.pipe(first()).subscribe(sponsors => currentSponsors = sponsors);

                if(currentSponsors.find(sponsor => sponsor.Organisation.Id == legalEntity.Id))
                {
                    alert(`${legalEntity.Name} is already a ${this._sponsorRole.Name}.`);
                    return;
                }

                const store = Store(this._deal);
                try
                {
                    store.SuspendPublish();

                    let today = new Date();
                    today.setUTCHours(0, 0, 0, 0);
                    let sponsor = <Sponsor>{
                        AutonomousAgent: legalEntity,
                        Organisation   : legalEntity,
                        Person         : null,
                        Role           : null,
                        Period:
                        {
                            Start: today,
                            End  : null
                        },
                        Equity         : null
                    };

                    sponsor.Role = this._sponsorRole;
                    this._deal.Parties.push(<Sponsor>store.Assert(sponsor));
                    this.NA = false;
                }
                finally
                {
                    store.UnsuspendPublish();
                }
            });
    }

    Delete(
        sponsor: Sponsor
        ): void
    {
        if(!confirm(`Delete ${this._sponsorRole.Name} ${sponsor.Organisation.Name}?`))
            return;

        const store = Store(this._deal);
        try
        {
            store.SuspendPublish();

            this._deal.Parties.splice(
                this._deal.Parties.indexOf(sponsor),
                1);

            store.DeleteEntity(sponsor);
        }
        finally
        {
            store.UnsuspendPublish();
        }
    }

    Build(
        ontology: IDealOntology
        ): void
    {
        this.Reset();

        let superClasses = ontology.SuperClasses(ontology.Deal);
        for(let superClass of superClasses)
            if(ontology.IsClassExpression.IClass(superClass))
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
