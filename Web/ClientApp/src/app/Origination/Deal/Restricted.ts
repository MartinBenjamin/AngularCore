import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClassificationScheme, ClassificationSchemeClassifier, Classifier } from '../../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../../ClassificationSchemeServiceProvider';
import { Guid } from '../../CommonDomainObjects';
import { DealProvider } from '../../DealProvider';
import { ClassificationSchemeIdentifier, Deal } from '../../Deals';
import { Store } from '../../EavStore/IEavStore';
import { IDomainObjectService } from '../../IDomainObjectService';

@Component(
    {
        selector: '[restricted]',
        templateUrl: './Restricted.html'
    })
export class Restricted implements OnDestroy
{
    private _subscriptions                  : Subscription[] = [];
    private _classificationSchemeClassifiers: ClassificationSchemeClassifier[];
    private _deal                           : Deal;
    private _classifier                     : Classifier;

    constructor(
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>,
        dealProvider: DealProvider
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    if(!this._deal)
                        this._classifier = null;

                    else
                        this._classifier = this._deal.Classifiers.find(classifer => (<any>classifer).$type === 'Web.Model.RestrictedClassifier, Web');

                    const store = Store(this._deal);
                    classificationSchemeService
                        .Get(ClassificationSchemeIdentifier.Restricted)
                        .subscribe(
                            classificationScheme =>
                            {
                                classificationScheme = <ClassificationScheme>store.Assert(classificationScheme);
                                this._classificationSchemeClassifiers = classificationScheme.Classifiers.filter(
                                    classificationSchemeClassifier => classificationSchemeClassifier.Super === null);
                            });
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

    get ClassificationSchemeClassifiers(): ClassificationSchemeClassifier[]
    {
        return this._classificationSchemeClassifiers;
    }

    get Classifier(): Classifier
    {
        return this._classifier;
    }

    set Classifier(
        classifier: Classifier
        )
    {
        const store = Store(this._deal);
        try
        {
            store.SuspendPublish();

            if(this._classifier)
                this._deal.Classifiers.splice(
                    this._deal.Classifiers.indexOf(this._classifier),
                    1);

            this._classifier = classifier;
            if(this._classifier)
                this._deal.Classifiers.push(this._classifier);
        }
        finally
        {
            store.UnsuspendPublish();
        }
    }
}
