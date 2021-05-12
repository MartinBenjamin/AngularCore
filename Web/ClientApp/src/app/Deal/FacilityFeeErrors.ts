import { Component, Inject, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from "rxjs";
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../Components/ValidatedProperty';
import { IErrors } from '../Ontologies/Validate';
import { FeeAmount, FeeAmountType } from '../FacilityAgreements';

type Error = [Property, string, string];

@Component(
    {
        selector: 'facility-fee-errors',
        template: `
<div *ngIf="Errors" style="color: red;">
  Apply was unsuccessful.  Please fix the errors and try again.
  <ul>
    <li *ngFor="let error of Errors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
  </ul>
</div>`
    })
export class FacilityFeeErrors implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _errors       : Error[];

    private static _propertyDisplayName =
        {
            ExpectedReceivedDate: "Expected/Received Date"
        };
    private static _errorMap: IErrors =
        {
            Mandatory       : "Mandatory",
            Invalid         : "Invalid",
            MustBe100Percent: "Must be 100%"
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

                                    if(object.$type == 'Web.Model.FeeAmount, Web')
                                    {
                                        let feeAmount = <FeeAmount>object;
                                        propertyDisplayName = feeAmount.Type == FeeAmountType.MonetaryAmount ? 'Amount' : '% Of Commitment';
                                    }
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
