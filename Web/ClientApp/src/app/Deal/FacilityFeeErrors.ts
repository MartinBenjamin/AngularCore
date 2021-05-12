import { Component, Inject, OnDestroy } from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from "rxjs";
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../Components/ValidatedProperty';
import { Facility, LenderParticipation } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { IErrors } from '../Ontologies/Validate';

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
                            objectErrors.forEach(
                                (propertyErrors, propertyName) =>
                                {
                                    let property: Property = [object, propertyName];
                                    propertyErrors.forEach(
                                        propertyError => this._errors.push([
                                                property,
                                                '',//propertyDisplayName,
                                                FacilityFeeErrors._errorMap[propertyError]
                                            ]));
                                }));

                //this._errors = [];
                //    let facilityErrors = errors.get(facility);
                //    if(facilityErrors)
                //    {
                //        this._facilityErrors = [];
                //        for(let entry of facilityErrors)
                //        {
                //            let propertyName = entry[0];
                //            let property: Property = [facility, propertyName];
                //            let propertyDisplayName = propertyName in FacilityErrors._facilityPropertyDisplayName ? FacilityErrors._facilityPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                //            for(let error of entry[1])
                //                this._facilityErrors.push(
                //                    [
                //                        property,
                //                        propertyDisplayName,
                //                        FacilityErrors._errorMap[error]
                //                    ]);
                //        }
                //    }
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get FacilityErrors(): Error[]
    {
        return this._facilityErrors;
    }

    Highlight(
        property: Property
        ): void
    {
        this._highlightedPropertyService.next(property);
    }
}
