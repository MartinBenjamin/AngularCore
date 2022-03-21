import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, Observable, NEVER } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Guid } from "../../CommonDomainObjects";
import { DealProvider } from '../../DealProvider';
import { Deal, Sponsor } from '../../Deals';
import { IDomainObjectService } from "../../IDomainObjectService";
import { LegalEntityFinder } from '../../LegalEntityFinder';
import { annotations } from '../../Ontologies/Annotations';
import { deals } from '../../Ontologies/Deals';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { roleIndividuals } from '../../Ontologies/RoleIndividuals';
import { AddIndividual } from '../../Ontology/AddIndividuals';
import { Store } from '../../Ontology/IEavStore';
import { ObservableGenerator } from '../../Ontology/ObservableGenerator';
import { Sort } from '../../Parties';
import { Role } from '../../Roles';
import { RoleServiceToken } from "../../RoleServiceProvider";
import { Contract } from '../../Contracts';
import { FacilityAgreement } from '../../FacilityAgreements';
import { facilityAgreements } from '../../Ontologies/FacilityAgreements';

@Component(
    {
        selector: 'facility-agreements',
        templateUrl: './FacilityAgreements.html'
    })
export class FacilityAgreements implements OnDestroy
{
    private _subscriptions     : Subscription[] = [];
    private _deal              : Deal;
    private _facilityAgreements: Observable<FacilityAgreement[]>;

    constructor(
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(deal => this._deal = deal));
        this._facilityAgreements = dealProvider.pipe(
            switchMap(
                deal =>
                {
                    if(!deal)
                        return NEVER;

                    const store = Store(deal);
                    //return store.Observe(
                    //    ['?facilityAgreement'],
                    //    [deal, 'Agreements', '?facilityAgreement'],['?facilityAgreement', '$type', 'Web.Models.FacilityAgreement, Web']);
                    const generator = new ObservableGenerator(
                        deals,
                        store);

                    return facilityAgreements.FacilityAgreement.Select(generator)
                        .pipe(map(facilityAgreements => [...facilityAgreements].sort((a, b) => a.Name.localeCompare(b.Name))));
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

    get FacilityAgreements(): Observable<FacilityAgreement[]>
    {
        return this._facilityAgreements;
    }

    Add(): void
    {
    }

    Delete(
        facilityAgreement: FacilityAgreement
        ): void
    {
        if(this._deal.Commitments.some(commitment => commitment.ConferredBy === facilityAgreement))
        {
            alert(`Facility Agreement ${facilityAgreement.Name} has related Facilities!`);
            return;
        }

        if(!confirm(`Delete Facility Agreement ${facilityAgreement.Name}?`))
            return;

        const store = Store(this._deal);
        try
        {
            store.SuspendPublish();

            this._deal.Agreements.splice(
                this._deal.Agreements.indexOf(facilityAgreement),
                1);

            store.DeleteEntity(facilityAgreement);
        }
        finally
        {
            store.UnsuspendPublish();
        }
    }
}
