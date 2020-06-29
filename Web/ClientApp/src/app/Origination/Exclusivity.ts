import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Classifier, ClassificationScheme, ClassificationSchemeClassifier } from '../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../ClassificationSchemeServiceProvider';
import { Guid } from '../CommonDomainObjects';
import { IDomainObjectService } from '../IDomainObjectService';
import { ClassificationSchemeIdentifier, Deal } from '../Deals';

@Component(
    {
        selector: '[exclusivity]',
        templateUrl: './Exclusivity.html'
    })
export class Exclusivity
{
    private _classificationSchemeClassifiers: ClassificationSchemeClassifier[];
    private _deal                           : Deal;
    private _classifier                     : Classifier;

    constructor(
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>
        )
    {
        classificationSchemeService
            .Get(ClassificationSchemeIdentifier.Exclusivity)
            .subscribe(
                classificationScheme => this._classificationSchemeClassifiers
                    = classificationScheme.Classifiers.filter(
                        classificationSchemeClassifier => classificationSchemeClassifier.Super == null));
    }

    get ClassificationSchemeClassifiers(): ClassificationSchemeClassifier[]
    {
        return this._classificationSchemeClassifiers;
    }

    set Deal(
        deal: Deal
        )
    {
        this._deal = deal;
        this.ComputeClassifier();
    }

    get Classifier(): Classifier
    {
        return this._classifier;
    }

    set Classifier(
        classifier: Classifier
        )
    {
        this._deal.Classifiers.splice(
            this._deal.Classifiers.indexOf(this._classifier),
            1);
        this._classifier = classifier;
        this._deal.Classifiers.push(this._classifier);
    }

    private ComputeClassifier(): void
    {
        if(!this._deal)
        {
            this._classifier = null;
            return;
        }

        let classifiers = this._deal.Classifiers.filter(classifer => (<any>classifer).$type == 'Web.Model.ExclusivityClassifier, Web')
        if(classifiers.length)
            this._classifier = classifiers[0];
    }
}
