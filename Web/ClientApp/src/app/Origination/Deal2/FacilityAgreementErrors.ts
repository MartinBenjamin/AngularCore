import { Component, Inject } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';
import { IErrors } from '../../Ontologies/Validate';

type Error = [Property, string, string];

@Component(
    {
        selector: 'facility-agreement-errors',
        template: `
<ul *ngIf="Errors|async as errors" style="color: red;">
  <li *ngFor="let error of errors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
</ul>`
    })
export class FacilityAgreementErrors
{
    private _errors: Observable<Error[]>;

    private static _propertyDisplayName =
        {
            ExecutionDate: 'Signed Date',
            EffectiveDate: 'Financial Close Date'
        };
    private static _errorMap: IErrors =
        {
            Mandatory       : 'Mandatory',
            Invalid         : 'Invalid',
            MustBe100Percent: 'Must be 100%'
        };

    constructor(
        @Inject(ErrorsObservableToken)
        errorsService: Observable<Map<object, Map<string, Set<keyof IErrors>>>>,
        @Inject(HighlightedPropertySubjectToken)
        private _highlightedPropertyService: Subject<Property>
        )
    {
        this._errors = errorsService.pipe(map(
            errorMap =>
            {
                if(!errorMap)
                    return null;

                const errors: Error[] = [];

                errorMap.forEach(
                    (objectErrors, object) => objectErrors.forEach(
                        (propertyErrors, propertyName) =>
                        {
                            let property: Property = [object, propertyName];
                            let propertyDisplayName = propertyName in FacilityAgreementErrors._propertyDisplayName ? FacilityAgreementErrors._propertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');

                            propertyErrors.forEach(
                                propertyError =>
                                    errors.push([
                                        property,
                                        propertyDisplayName,
                                        FacilityAgreementErrors._errorMap[propertyError]
                                    ]));
                        }));

                return errors;
            }));
    }

    get Errors(): Observable<Error[]>
    {
        return this._errors;
    }

    Highlight(
        property: Property
        ): void
    {
        this._highlightedPropertyService.next(property);
    }
}
