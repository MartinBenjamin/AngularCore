import { Component, Inject, OnDestroy } from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from "rxjs";
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../Components/ValidatedProperty';
import { Facility, LenderParticipation } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { IErrors } from '../Ontologies/Validate';

type Error = [Property, string, string];

@Component(
    {
        selector: 'facility-errors',
        template: `
<div *ngIf="FacilityErrors" style="color: red;">
  Apply was unsuccessful.  Please fix the errors and try again.
  <ul>
    <li *ngFor="let error of FacilityErrors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
  </ul>
</div>`
    })
export class FacilityErrors implements OnDestroy
{
    private _subscriptions : Subscription[] = [];
    private _facilityErrors: Error[];

    private static _facilityPropertyDisplayName =
        {
            Expected1StDrawdownDate: "Expected 1<sup>st</sup> Drawdown Date"
        };
    private static _errorMap: IErrors =
        {
            Mandatory       : "Mandatory",
            Invalid         : "Invalid",
            MustBe100Percent: "Must be 100%"
        };

    constructor(
        facilityProvider : FacilityProvider,
        @Inject(ErrorsObservableToken)
        errorsService: Observable<Map<object, Map<string, Set<keyof IErrors>>>>,
        @Inject(HighlightedPropertySubjectToken)
        private _highlightedPropertyService: Subject<Property>
        )
    {
        this._subscriptions.push(
            combineLatest(
                facilityProvider,
                errorsService
                ).subscribe(
                    combined =>
                    {
                        this._facilityErrors = null;
                        let facility: Facility;
                        let errors: Map<object, Map<string, Set<keyof IErrors>>>;
                        [facility, errors] = combined;

                        if(!(facility && errors))
                            return;

                        let facilityErrors = errors.get(facility);
                        if(facilityErrors)
                        {
                            this._facilityErrors = [];
                            for(let entry of facilityErrors)
                            {
                                let propertyName = entry[0];
                                let property: Property = [facility, propertyName];
                                let propertyDisplayName = propertyName in FacilityErrors._facilityPropertyDisplayName ? FacilityErrors._facilityPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                for(let error of entry[1])
                                    this._facilityErrors.push(
                                        [
                                            property,
                                            propertyDisplayName,
                                            FacilityErrors._errorMap[error]
                                        ]);
                            }
                        }

                        let lenderParticipation = <LenderParticipation>facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web');
                        facilityErrors = errors.get(lenderParticipation);
                        if(facilityErrors)
                        {
                            this._facilityErrors = this._facilityErrors || [];
                            for(let entry of facilityErrors)
                            {
                                let propertyName = entry[0];
                                let property: Property = [lenderParticipation, propertyName];
                                let propertyDisplayName = propertyName in FacilityErrors._facilityPropertyDisplayName ? FacilityErrors._facilityPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                for(let error of entry[1])
                                    this._facilityErrors.push(
                                        [
                                            property,
                                            propertyDisplayName,
                                            FacilityErrors._errorMap[error]
                                        ]);
                            }
                        }
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
