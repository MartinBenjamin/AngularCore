import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DealProvider } from '../DealProvider';
import { deals } from '../Ontologies/Deals';
import { IDealOntology } from '../Ontologies/IDealOntology';

@Component(
    {
        templateUrl: './KeyCounterparties.html'
    })
export class KeyCounterparties implements OnDestroy
{
    private _subscriptions  : Subscription[] = [];
    private _sponsorsEnabled: boolean;

    constructor(
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(
            deal =>
            {
                if(deal)
                    this.Build(deal[0].Ontology);
            }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get SponsorsEnabled(): boolean
    {
        return this._sponsorsEnabled;
    }

    Build(
        ontology: IDealOntology
        ): void
    {
        this.Reset();

        let superClasses = ontology.SuperClasses(ontology.Deal);
        for(let superClass of superClasses)
            for(let annotation of superClass.Annotations)
                if(annotation.Property == deals.ComponentBuildAction &&
                    annotation.Value in this)
                    this[annotation.Value]();
    }

    Reset(): void
    {
        this._sponsorsEnabled = false;
    }

    AddSponsors(): void
    {
        this._sponsorsEnabled = true;
    }
}
