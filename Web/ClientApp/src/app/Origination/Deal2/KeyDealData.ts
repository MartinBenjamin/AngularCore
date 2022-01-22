import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomainObject, Guid } from '../../CommonDomainObjects';
import { CurrenciesToken } from '../../CurrencyServiceProvider';
import { DealProvider } from '../../DealProvider';
import { ClassificationSchemeIdentifier, Deal } from '../../Deals';
import { Currency } from '../../Iso4217';
import { Store } from '../../Ontology/IEavStore';

@Component(
    {
        templateUrl: './KeyDealData.html',
        encapsulation: ViewEncapsulation.None
    })
export class KeyDealData implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _restricted   : Observable<boolean>;

    constructor(
        @Inject(CurrenciesToken)
        private _currencies: Observable<Currency[]>,
        dealProvider       : DealProvider
        )
    {
        this._subscriptions.push(dealProvider.subscribe(
            deal =>
            {
                this._deal = deal;
                if(this._deal)
                {
                    const store = Store(this._deal);
                    //this._restricted = store.Observe(
                    //    ['?classifier'],
                    //    [this._deal, "Classifiers", '?classifier'],
                    //    ['?classifier', '$type', 'Web.Model.RestrictedClassifier, Web'],
                    //    ['?classificationScheme', 'Id', ClassificationSchemeIdentifier.Restricted],
                    //    ['?classificationScheme', 'Classifiers', '?classificationSchemeClassifier'],
                    //    ['?classificationSchemeClassifier', 'Classifier', '?classifier'],
                    //    ['?classificationScheme', 'Classifiers', '?restrictedClassificationSchemeClassifier'],
                    //    ['?restrictedClassificationSchemeClassifier', 'Classifier', '?restrictedClassifier'],
                    //    ['?restrictedClassifier', 'Id', '5cd2b680-cb36-49e1-8d3d-62ada643a389'],
                    //    ['?classificationSchemeClassifier', 'Super', '?restrictedClassificationSchemeClassifier']).pipe(
                    //        map(classifiers => classifiers.length === 1));
                }
            }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Currencies(): Observable<Currency[]>
    {
        return this._currencies;
    }

    get Deal(): Deal
    {
        return this._deal;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
