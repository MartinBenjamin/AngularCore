import { Component, Inject, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from "rxjs";
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';
import { IErrors } from '../../Ontologies/Validate';

type Error = [Property, string, string];

@Component(
    {
        selector: 'facility-fee-errors',
        template: `
<ul *ngIf="Errors" style="color: red;">
  <li *ngFor="let error of Errors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
</ul>`
    })
export class FacilityFeeErrors implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _errors       : Error[];

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
        this._subscriptions.push(
            errorsService.subscribe(
                errors =>
                {
                    this._errors = null;

                    if(!errors)
                        return;

                    errors.forEach(
                        (objectErrors, object) =>
                        {
                            this._errors = this._errors || [];
                            objectErrors.forEach(
                                (propertyErrors, propertyName) =>
                                {
                                    let property: Property = [object, propertyName];
                                    let propertyDisplayName: string;

                                    if(propertyName === 'NumericValue')
                                        propertyDisplayName = (<any>object).MeasurementUnit ? '% Of Commitment' : 'Amount';

                                    else
                                        propertyDisplayName = propertyName in FacilityFeeErrors._propertyDisplayName ? FacilityFeeErrors._propertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');

                                    propertyErrors.forEach(
                                        propertyError => this._errors.push([
                                            property,
                                            propertyDisplayName,
                                            FacilityFeeErrors._errorMap[propertyError]
                                        ]));
                                });
                        });
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Errors(): Error[]
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
