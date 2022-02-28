import { Component, Inject } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';
import { IErrors } from '../../Ontologies/Validate';
import { Axiom } from '../../Ontology/Axiom';
import { IsDLSafeRule, PropertyAtom, IPropertyAtom } from '../../Ontology/DLSafeRule';

type Error = [Property, string, string];

@Component(
    {
        selector: 'facility-fee-errors',
        template: `
<ul *ngIf="Errors|async as errors" style="color: red;">
  <li *ngFor="let error of errors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
</ul>`
    })
export class FacilityFeeErrors
{
    private _errors: Observable<Error[]>;

    private static _propertyDisplayName =
        {
            ExpectedReceivedDate: 'Expected/Received Date',
            Year                : 'Accrual Date Year',
            Month               : 'Accrual Date Month'
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
                            let propertyDisplayName: string;

                            if(propertyName === 'NumericValue')
                                propertyDisplayName = (<any>object).MeasurementUnit ? '% Of Commitment' : 'Amount';

                            else
                                propertyDisplayName = propertyName in FacilityFeeErrors._propertyDisplayName ? FacilityFeeErrors._propertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');

                            propertyErrors.forEach(
                                propertyError =>
                                {
                                    if(IsDLSafeRule(<any>propertyError))
                                    {
                                        // Assume comparison.
                                        let count = 0;
                                        const secondProperty = <IPropertyAtom>propertyError.Head.find(
                                            atom =>
                                            {
                                                if(atom instanceof PropertyAtom)
                                                    if(++count === 2)
                                                        return true;
                                                return false;
                                            });
                                        const secondPropertyName = secondProperty.PropertyExpression.LocalName;
                                        const secondPropertyDisplayName = secondPropertyName in FacilityFeeErrors._propertyDisplayName ?
                                            FacilityFeeErrors._propertyDisplayName[secondPropertyName] : secondPropertyName.replace(/\B[A-Z]/g, ' $&');
                                        errors.push([
                                            property,
                                            propertyDisplayName,
                                            `Must be less than ${secondPropertyDisplayName}`
                                        ]);
                                    }
                                    else
                                        errors.push([
                                            property,
                                            propertyDisplayName,
                                            FacilityFeeErrors._errorMap[propertyError]
                                        ]);
                                });
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
