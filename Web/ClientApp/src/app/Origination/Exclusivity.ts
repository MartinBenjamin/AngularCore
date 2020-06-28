import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Classifier, ClassificationScheme, ClassificationSchemeClassifier } from '../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../ClassificationSchemeServiceProvider';
import { Guid } from '../CommonDomainObjects';
import { IDomainObjectService } from '../IDomainObjectService';

@Component(
    {
        selector: '[exclusivity]',
        templateUrl: './Exclusivity.html'
    })
export class Exclusivity
{
    private _classificationSchemeClassifiers: Observable<ClassificationSchemeClassifier[]>;
    private _classifier                     : Classifier;

    constructor(
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>
        )
    {
        this._classificationSchemeClassifiers = classificationSchemeService
            .Get('f7c20b62-ffe8-4c20-86b4-e5c68ba2469d')
            .pipe(map(classificationScheme => classificationScheme.Classifiers.filter(
                classificationSchemeClassifier => classificationSchemeClassifier.Super == null)));
    }

    get ClassificationSchemeClassifiers(): Observable<ClassificationSchemeClassifier[]>
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
    }
}
