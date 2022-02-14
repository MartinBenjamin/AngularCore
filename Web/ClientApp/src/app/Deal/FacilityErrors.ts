import { Component, Inject, OnDestroy } from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from "rxjs";
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../Components/ValidatedProperty';
import { Facility } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { IErrors } from '../Ontologies/Validate';

type Error = [Property, string, string];

@Component(
    {
        selector: 'facility-errors',
        template: `
<ul *ngIf="Errors" style="color: red;">
  <li *ngFor="let error of Errors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
</ul>`
    })
export class FacilityErrors implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _errors       : Error[];

    private static _facilityPropertyDisplayName =
        {
            Amount: 'Total Debt Size',
            Expected1StDrawdownDate: 'Expected 1<sup>st</sup> Drawdown Date'
        };
    private static _errorMap: IErrors =
        {
            Mandatory       : 'Mandatory',
            Invalid         : 'Invalid',
            MustBe100Percent: 'Must be 100%'
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
                        this._errors = null;
                        let facility: Facility;
                        let errors: Map<object, Map<string, Set<keyof IErrors>>>;
                        [facility, errors] = combined;

                        if(!(facility && errors))
                            return;

                        [
                            facility,
                            facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web'),
                            facility.Parts.find(part => (<any>part).$type === 'Web.Model.ExternalFunding, Web')
                        ].forEach(
                            object =>
                            {
                                let objectErrors = errors.get(object);                         

                                if(objectErrors)
                                {
                                    this._errors = this._errors || [];
                                    objectErrors.forEach(
                                        (propertyErrors, propertyName) =>
                                        {
                                            let property: Property = [object, propertyName];
                                            let propertyDisplayName = propertyName in FacilityErrors._facilityPropertyDisplayName ? FacilityErrors._facilityPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                            propertyErrors.forEach(
                                                propertyError => this._errors.push(
                                                    [
                                                        property,
                                                        propertyDisplayName,
                                                        FacilityErrors._errorMap[propertyError]
                                                    ]));
                                        });
                                }
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
