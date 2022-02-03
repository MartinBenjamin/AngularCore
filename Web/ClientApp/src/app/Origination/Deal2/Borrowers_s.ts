import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Guid } from '../../CommonDomainObjects';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { IDomainObjectService } from '../../IDomainObjectService';
import { LegalEntityFinder } from '../../LegalEntityFinder';
import { deals } from '../../Ontologies/Deals';
import { roleIndividuals } from '../../Ontologies/RoleIndividuals';
import { AddIndividual } from '../../Ontology/AddIndividuals';
import { Store } from '../../Ontology/IEavStore';
import { ObservableGenerator } from '../../Ontology/ObservableGenerator';
import { PartyInRole, Sort } from '../../Parties';
import { Role } from '../../Roles';
import { RoleServiceToken } from '../../RoleServiceProvider';

@Component(
    {
        selector: 'borrowers-s',
        templateUrl: './Borrowers_s.html'
    })
export class Borrowers_s implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _borrowerRole : Role;
    private _deal         : Deal;
    private _borrowers    : PartyInRole[];

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
                        this._borrowerRole = <Role>AddIndividual(
                            deal.Ontology,
                            roleIndividuals.Borrower,
                            store);
                        roleService.Get(this._borrowerRole.Id).subscribe(borrowerRole => store.Add(borrowerRole));

                        const generator = new ObservableGenerator(
                            deals,
                            store);

                        this._subscriptions.push(deals.BorrowerParty.Select(generator)
                            .pipe(map(borrowers => [...borrowers].sort(Sort)))
                            .subscribe(borrowers => this._borrowers = borrowers));
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

    get Borrowers(): PartyInRole[]
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

                const store = Store(this._deal);
                try
                {
                    store.SuspendPublish();
                    let today = new Date();
                    today.setUTCHours(0, 0, 0, 0);
                    let borrower = <PartyInRole>{
                        AutonomousAgent: legalEntity,
                        Organisation: legalEntity,
                        Person: null,
                        Role: this._borrowerRole,
                        Period:
                        {
                            Start: today,
                            End: null
                        }
                    };
                    borrower = <PartyInRole>Store(this._deal).Add(borrower);
                    this._deal.Parties.push(borrower);
                }
                finally
                {
                    store.UnsuspendPublish();
                }
            });
    }  

    Delete(
        borrower: PartyInRole
        ): void
    {
        if(!confirm(`Delete ${this._borrowerRole.Name} ${borrower.Organisation.Name}?`))
            return;

        this._deal.Parties.splice(
            this._deal.Parties.indexOf(borrower),
            1);

        Store(this._deal).DeleteEntity(borrower);
    }
}
