import { Component, Inject } from '@angular/core';
import { combineLatest, Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';
import { FacilityProvider } from '../../FacilityProvider';
import { IErrors } from '../../Ontologies/Validate';

type Error = [Property, string, string];

@Component(
    {
        selector: 'facility-errors',
        template: `
<ul *ngIf="Errors|async as errors" style="color: red;">
  <li *ngFor="let error of errors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
</ul>`
    })
export class FacilityErrors
{
    private _errors: Observable<Error[]>;

    private static _facilityPropertyDisplayName =
        {
            Amount: 'Total Debt Size',
            Expected1StDrawdownDate: 'Expected 1<sup>st</sup> Drawdown Date'
        };
    private static _externalFundingPropertyDisplayName =
        {
            NumericValue: 'External Funding Percentage',
            Obligors: 'External Funding Providers'
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
        this._errors = combineLatest(
            facilityProvider,
            errorsService
        ).pipe(
            map(
                ([facility, errorMap]) =>
                {
                    if(!(facility && errorMap))
                        return null;

                    const errors: Error[] = [];

                    [
                        facility,
                        facility.Parts.find(part => (<any>part).$type === 'Web.Model.LenderParticipation, Web')
                    ].forEach(
                        object =>
                        {
                            let objectErrors = errorMap.get(object);

                            if(objectErrors)
                            {
                                this._errors = this._errors || [];
                                objectErrors.forEach(
                                    (propertyErrors, propertyName) =>
                                    {
                                        let property: Property = [object, propertyName];
                                        let propertyDisplayName = propertyName in FacilityErrors._facilityPropertyDisplayName ? FacilityErrors._facilityPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                        propertyErrors.forEach(
                                            propertyError => errors.push(
                                                [
                                                    property,
                                                    propertyDisplayName,
                                                    FacilityErrors._errorMap[propertyError]
                                                ]));
                                    });
                            }
                        });

                    const externalFunding = facility.Parts.find(part => (<any>part).$type === 'Web.Model.ExternalFunding, Web');
                    if(externalFunding)
                    {
                        let externalFundingErrors = errorMap.get(externalFunding);

                        if(externalFundingErrors)
                        {
                            this._errors = this._errors || [];
                            externalFundingErrors.forEach(
                                (propertyErrors, propertyName) =>
                                {
                                    let property: Property = [externalFunding, propertyName];
                                    let propertyDisplayName = propertyName in FacilityErrors._externalFundingPropertyDisplayName ? FacilityErrors._externalFundingPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                    propertyErrors.forEach(
                                        propertyError => errors.push(
                                            [
                                                property,
                                                propertyDisplayName,
                                                FacilityErrors._errorMap[propertyError]
                                            ]));
                                });
                        }
                    }

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
