import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NEVER, Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { FacilityAgreement } from '../../FacilityAgreements';
import { Store } from '../../Ontology/IEavStore';

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

    @ViewChild('editor', { static: true })
    private _facilityAgreementEditor: import('./FacilityAgreementEditor').FacilityAgreementEditor;

    constructor(
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(deal => this._deal = deal));
        this._facilityAgreements = dealProvider.pipe(
            switchMap(
                deal => !deal ? NEVER : Store(deal).Observe(
                    ['?facilityAgreement'],
                    [[deal, 'Agreements', '?facilityAgreement'],
                    ['?facilityAgreement', '$type', 'Web.Model.FacilityAgreement, Web'],
                    ['?facilityAgreement', 'Name', undefined]]
                    ).pipe(
                        map((facilityAgreements: [FacilityAgreement][]) => facilityAgreements.map(facilityAgreement => facilityAgreement[0])),
                        map((facilityAgreements: FacilityAgreement[]) => facilityAgreements.sort((a, b) => a.Name.localeCompare(b.Name))))));
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
        this._facilityAgreementEditor.Create(() => { });
    }

    Update(
        facilityAgreement: FacilityAgreement
        ): void
    {
        this._facilityAgreementEditor.Update(
            facilityAgreement,
            () => { });
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
