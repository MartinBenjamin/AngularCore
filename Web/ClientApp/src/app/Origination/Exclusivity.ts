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
    private _subscriptions: Subscription[] = [];
    private _classificationScheme           : ClassificationScheme;
    private _classificationSchemeClassifiers: ClassificationSchemeClassifier[];
    private _deal                           : Deal;
    private _classifier                     : Classifier;
    private _exclusive                      : boolean;

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
                    this.ComputeExclusive();
                });

        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
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

        let classifiers = this._deal.Classifiers.filter(classifer => (<any>classifer).$type == 'Web.Model.ExclusivityClassifier, Web')
        if(classifiers.length)
            this._classifier = classifiers[0];

        this.ComputeExclusive();
    }

    private ComputeExclusive(): void
    {
        if(!(this._classificationSchemeClassifiers && this._classifier))
        {
            this._exclusive = false;
            return;
        }

        let yes = this._classificationSchemeClassifiers.filter(
            classificationSchemeClassifier => classificationSchemeClassifier.Classifier.Id == ExclusivityClassifierIdentifier.Yes)[0];

        let current = this._classificationScheme.Classifiers.filter(
            classificationSchemeClassifier => classificationSchemeClassifier.Classifier.Id == this._classifier.Id)[0];

        this._exclusive = yes.Interval.Start <= current.Interval.Start && current.Interval.End <= yes.Interval.End;
    }
}
