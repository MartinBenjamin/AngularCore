import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClassificationScheme, ClassificationSchemeClassifier, Classifier } from '../../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../../ClassificationSchemeServiceProvider';
import { Guid } from '../../CommonDomainObjects';
import { DealProvider } from '../../DealProvider';
import { ClassificationSchemeIdentifier, Deal, Exclusivity as ExclusivityCommitment, ExclusivityClassifierIdentifier } from '../../Deals';
import { IDomainObjectService } from '../../IDomainObjectService';
import { Store } from '../../Ontology/IEavStore';

@Component(
    {
        selector: '[exclusivity]',
        templateUrl: './Exclusivity.html'
    })
export class Exclusivity implements OnDestroy
{
    private _subscriptions                  : Subscription[] = [];
    private _classificationSchemeClassifiers: ClassificationSchemeClassifier[];
    private _deal                           : Deal;
    private _classifier                     : Classifier;
    private _exclusivity                    : ExclusivityCommitment;
    private _map                            : Map<Guid, ClassificationSchemeClassifier>;
    private _yes                            : ClassificationSchemeClassifier;

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
                    {
                        this._classifier = null;
                        this._exclusivity = null;
                        return;
                    }

                    classificationSchemeService
                        .Get(ClassificationSchemeIdentifier.Exclusivity)
                        .subscribe(
                            classificationScheme =>
                            {
                                classificationScheme = <ClassificationScheme>Store(this._deal).Assert(classificationScheme);
                                this._classificationSchemeClassifiers = classificationScheme.Classifiers.filter(
                                    classificationSchemeClassifier => classificationSchemeClassifier.Super === null);
                                this._map = new Map<Guid, ClassificationSchemeClassifier>(
                                    classificationScheme.Classifiers.map(
                                        classificationSchemeClassifier =>
                                            [
                                                classificationSchemeClassifier.Classifier.Id,
                                                classificationSchemeClassifier
                                            ]));
                                this._yes = this._classificationSchemeClassifiers.find(
                                    classificationSchemeClassifier =>
                                        classificationSchemeClassifier.Classifier.Id === ExclusivityClassifierIdentifier.Yes);

                                this._classifier = this._deal.Classifiers.find(classifer => (<any>classifer).$type === 'Web.Model.ExclusivityClassifier, Web');
                                this._exclusivity = this._deal.Commitments.find(
                                    (commitment): commitment is ExclusivityCommitment => (<any>commitment).$type === 'Web.Model.Exclusivity, Web');
                                this.ComputeExclusive();
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

            this.ComputeExclusive();
        }
        finally
        {
            store.UnsuspendPublish();
        }
    }

    get Exclusivity(): ExclusivityCommitment
    {
        return this._exclusivity;
    }

    private ComputeExclusive(): void
    {
        if(!this._classificationSchemeClassifiers)
            return;

        const store = Store(this._deal);
        try
        {
            store.SuspendPublish();
            if(!this._classifier)
            {
                if(this._exclusivity)
                {
                    this._deal.Commitments.splice(
                        this._deal.Commitments.indexOf(this._exclusivity),
                        1);
                    store.DeleteEntity(this._exclusivity);
                    this._exclusivity = null;
                }
                return;
            }

            let current = this._map.get(this._classifier.Id);
            let exclusive = this._yes.Interval.Start <= current.Interval.Start && current.Interval.End <= this._yes.Interval.End;
            if(exclusive && !this._exclusivity)
            {
                this._exclusivity = store.Assert({
                    EndDate: null,
                    $type  : 'Web.Model.Exclusivity, Web'
                });
                this._deal.Commitments.push(this._exclusivity);
            }
            else if(!exclusive && this._exclusivity)
            {
                this._deal.Commitments.splice(
                    this._deal.Commitments.indexOf(this._exclusivity),
                    1);
                store.DeleteEntity(this._exclusivity);
                this._exclusivity = null;
            }
        }
        finally
        {
            store.UnsuspendPublish();
        }
    }
}
