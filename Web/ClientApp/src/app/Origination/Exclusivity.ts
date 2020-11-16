import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClassificationScheme, ClassificationSchemeClassifier, Classifier } from '../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../ClassificationSchemeServiceProvider';
import { Guid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { ClassificationSchemeIdentifier, Deal, ExclusivityClassifierIdentifier } from '../Deals';
import { IDomainObjectService } from '../IDomainObjectService';

@Component(
    {
        selector: '[exclusivity]',
        templateUrl: './Exclusivity.html'
    })
export class Exclusivity implements OnDestroy
{
    private _subscriptions                  : Subscription[] = [];
    private _classificationScheme           : ClassificationScheme;
    private _classificationSchemeClassifiers: ClassificationSchemeClassifier[];
    private _deal                           : Deal;
    private _classifier                     : Classifier;
    private _exclusive                      : boolean;
    private _map                            = new Map<Guid, ClassificationSchemeClassifier>();
    private _yes                            : ClassificationSchemeClassifier;

    constructor(
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>,
        dealProvider: DealProvider
        )
    {
        classificationSchemeService
            .Get(ClassificationSchemeIdentifier.Exclusivity)
            .subscribe(
                classificationScheme =>
                {
                    this._classificationScheme = classificationScheme;
                    this._classificationSchemeClassifiers = classificationScheme.Classifiers.filter(
                        classificationSchemeClassifier => classificationSchemeClassifier.Super == null);
                    classificationScheme.Classifiers.forEach(
                        classificationSchemeClassifier => this._map.set(
                            classificationSchemeClassifier.Classifier.Id,
                            classificationSchemeClassifier));
                    this._yes = this._classificationSchemeClassifiers.find(
                        classificationSchemeClassifier =>
                            classificationSchemeClassifier.Classifier.Id == ExclusivityClassifierIdentifier.Yes);
                    this.ComputeExclusive();
                });

        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal[0];
                    this.ComputeClassifier();
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
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
        if(this._classifier)
            this._deal.Classifiers.splice(
                this._deal.Classifiers.indexOf(this._classifier),
                1);
        this._classifier = classifier;
        this._deal.Classifiers.push(this._classifier);
        this.ComputeExclusive();
    }

    get Exclusive(): boolean
    {
        return this._exclusive;
    }

    private ComputeClassifier(): void
    {
        if(!this._deal)
        {
            this._classifier = null;
            this._exclusive = false;
            return;
        }

        this._classifier = this._deal.Classifiers.find(classifer => (<any>classifer).$type == 'Web.Model.ExclusivityClassifier, Web');
        this.ComputeExclusive();
    }

    private ComputeExclusive(): void
    {
        if(!(this._classificationSchemeClassifiers && this._classifier))
        {
            this._exclusive = false;
            return;
        }

        let current = this._map.get(this._classifier.Id);
        this._exclusive = this._yes.Interval.Start <= current.Interval.Start && current.Interval.End <= this._yes.Interval.End;
    }
}
