import { Component, Inject } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';
import { Fee } from '../../Fees';
import { IErrors } from '../../Ontologies/Validate';
import { ComparisonAtom, GreaterThanAtom, GreaterThanOrEqualAtom, IComparisonAtom, IPropertyAtom, IsDLSafeRule, LessThanAtom, LessThanOrEqualAtom, PropertyAtom } from '../../Ontology/DLSafeRule';

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

    private static _temporalText = new Map<Function, string>(
        [
            [LessThanAtom          , 'before'      ],
            [LessThanOrEqualAtom   , 'on or before'],
            [GreaterThanOrEqualAtom, 'on or after' ],
            [GreaterThanAtom       , 'after'       ]
        ]);

    private static _propertyDisplayName =
        {
            MeasurementUnit     : 'Currency',
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
                                propertyDisplayName = (<Fee>object).MeasurementUnit === 0.01 ? '% Of Commitment' : 'Amount';

                            else
                                propertyDisplayName = propertyName in FacilityFeeErrors._propertyDisplayName ? FacilityFeeErrors._propertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');

                            propertyErrors.forEach(
                                propertyError =>
                                {
                                    if(IsDLSafeRule(propertyError))
                                    {
                                        // Assume comparison.
                                        const comparison = propertyError.Head.find<IComparisonAtom>((atom): atom is IComparisonAtom => atom instanceof ComparisonAtom);
                                        const rhsProperty = propertyError.Head.find<IPropertyAtom>(
                                            (atom): atom is IPropertyAtom => atom instanceof PropertyAtom && atom.Range === comparison.Rhs);

                                        const rhsPropertyName = rhsProperty.PropertyExpression.LocalName;
                                        const rhsPropertyDisplayName = rhsPropertyName in FacilityFeeErrors._propertyDisplayName ?
                                            FacilityFeeErrors._propertyDisplayName[rhsPropertyName] : rhsPropertyName.replace(/\B[A-Z]/g, ' $&');
                                        errors.push([
                                            property,
                                            propertyDisplayName,
                                            `Must be ${FacilityFeeErrors._temporalText.get(comparison.constructor)} ${rhsPropertyDisplayName}`
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
