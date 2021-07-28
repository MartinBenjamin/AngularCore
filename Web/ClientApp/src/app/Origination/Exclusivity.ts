import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClassificationScheme, ClassificationSchemeClassifier, Classifier } from '../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../ClassificationSchemeServiceProvider';
import { Guid, EmptyGuid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { ClassificationSchemeIdentifier, Deal, ExclusivityClassifierIdentifier, Exclusivity as ExclusivityCommitment } from '../Deals';
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
    private _exclusivity                    : ExclusivityCommitment;
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
                    this._deal = deal;
                    this.ComputeClassifier();
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
        if(this._classifier)
            this._deal.Classifiers.splice(
                this._deal.Classifiers.indexOf(this._classifier),
                1);

        this._classifier = classifier;
        if(this._classifier)
            this._deal.Classifiers.push(this._classifier);

        this.ComputeExclusive();
    }

    get Exclusivity(): ExclusivityCommitment
    {
        return this._exclusivity;
    }

    private ComputeClassifier(): void
    {
        if(!this._deal)
        {
            this._classifier = null;
            this._exclusivity = null;
            return;
        }

        this._classifier = this._deal.Classifiers.find(classifer => (<any>classifer).$type == 'Web.Model.ExclusivityClassifier, Web');
        this._exclusivity = <ExclusivityCommitment>this._deal.Confers.find(commitment => (<any>commitment).$type == 'Web.Model.Exclusivity, Web');
        this.ComputeExclusive();
    }

    private ComputeExclusive(): void
    {
        if(!this._classificationSchemeClassifiers)
            return;

        if(!this._classifier)
        {
            if(this._exclusivity !== null)
            {
                this._deal.Confers.splice(
                    this._deal.Confers.indexOf(this._exclusivity),
                    1);
                this._exclusivity = null;
            }
            return;
        }

        let current = this._map.get(this._classifier.Id);
        let exclusive = this._yes.Interval.Start <= current.Interval.Start && current.Interval.End <= this._yes.Interval.End;
        if(exclusive && this._exclusivity === null)
        {
            this._exclusivity =
                <ExclusivityCommitment>{
                    Id     : EmptyGuid,
                    EndDate: null
                };
            (<any>this._exclusivity).$type = 'Web.Model.Exclusivity, Web';
            this._deal.Confers.push(this._exclusivity);
        }
        else if(!exclusive && this._exclusivity !== null)
        {
            this._deal.Confers.splice(
                this._deal.Confers.indexOf(this._exclusivity),
                1);
            this._exclusivity = null;
        }
    }
}
