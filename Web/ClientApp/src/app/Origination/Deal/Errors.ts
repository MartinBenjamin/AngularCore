import { Component, Inject, OnDestroy } from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from "rxjs";
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { Deal, DealRoleIdentifier } from '../../Deals';
import { IErrors } from '../../Ontologies/Validate';

type Error = [Property, string, string];

@Component(
    {
        selector: 'errors',
        template: `
<div *ngIf="DealErrors || SponsorErrors || ExclusivityErrors" style="color: red;">
  Save was unsuccessful.  Please fix the errors and try again.
  <ul>
    <li *ngFor="let error of DealErrors" [innerHTML]="error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
    <li *ngFor="let error of SponsorErrors" [innerHTML]="error[0][0].Role.Name + ' [' + error[0][0].Organisation.Name + '] ' + error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
    <li *ngFor="let error of ExclusivityErrors" [innerHTML]="'Exclusivity ' + error[1] + ': ' + error[2]" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
    <li *ngFor="let error of FacilityErrors" [innerHTML]="'Tranche[' + error[0][0].Name + ']: Has errors'" (click)="Highlight(error[0])" style="cursor: pointer;"></li>
  </ul>
</div>`
    })
export class Errors implements OnDestroy
{
    private _subscriptions    : Subscription[] = [];
    private _dealErrors       : Error[];
    private _sponsorErrors    : Error[];
    private _exclusivityErrors: Error[];
    private _facilityErrors   : Error[];

    private static _dealPropertyDisplayName =
        {
            Name            : 'Deal Name',
            GeographicRegion: 'Country',
            Currency        : 'Base Currency'
        };
    private static _sponsorPropertyDisplayName =
        {
        };
    private static _exclusivityPropertyDisplayName =
        {
            EndDate: "Date",
        };
    private static _errorMap: IErrors =
        {
            Mandatory       : 'Mandatory',
            Invalid         : 'Invalid',
            MustBe100Percent: 'Must be 100%'
        };

    constructor(
        dealProvider : DealProvider,
        @Inject(ErrorsObservableToken)
        errorsService: Observable<Map<object, Map<string, Set<keyof IErrors>>>>,
        @Inject(HighlightedPropertySubjectToken)
        private _highlightedPropertyService: Subject<Property>
        )
    {
        this._subscriptions.push(
            combineLatest(
                dealProvider,
                errorsService
                ).subscribe(
                    combined =>
                    {
                        this._dealErrors        = null;
                        this._sponsorErrors     = null;
                        this._exclusivityErrors = null;
                        this._facilityErrors    = null;
                        let deal  : Deal;
                        let errors: Map<object, Map<string, Set<keyof IErrors>>>;
                        [deal, errors] = combined;

                        if(!(deal && errors))
                            return;

                        let dealErrors = errors.get(deal);
                        if(dealErrors)
                        {
                            this._dealErrors = [];
                            for(let entry of dealErrors)
                            {
                                let propertyName = entry[0];
                                let property: Property = [deal, propertyName];
                                let propertyDisplayName = propertyName in Errors._dealPropertyDisplayName ? Errors._dealPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                for(let error of entry[1])
                                    this._dealErrors.push(
                                        [
                                            property,
                                            propertyDisplayName,
                                            Errors._errorMap[error]
                                        ]);
                            }
                        }

                        // Include Sponsor errors.
                        for(let sponsor of deal.Parties.filter(party => party.Role.Id === DealRoleIdentifier.Sponsor))
                        {
                            let sponsorErrors = errors.get(sponsor);
                            if(sponsorErrors)
                            {
                                this._sponsorErrors = this._sponsorErrors || [];
                                for(let entry of sponsorErrors)
                                {
                                    let propertyName = entry[0];
                                    let property: Property = [sponsor, propertyName];
                                    let propertyDisplayName = propertyName in Errors._sponsorPropertyDisplayName ? Errors._sponsorPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                    for(let error of entry[1])
                                        this._sponsorErrors.push(
                                            [
                                                property,
                                                propertyDisplayName,
                                                Errors._errorMap[error]
                                            ]);
                                }
                            }
                        }

                        // Include Exclusivity errors.
                        let exclusivity = deal.Confers.find(commitment => (<any>commitment).$type == 'Web.Model.Exclusivity, Web');
                        if(exclusivity)
                        {
                            let exclusivityErrors = errors.get(exclusivity);
                            if(exclusivityErrors)
                            {
                                this._exclusivityErrors = [];
                                for(let entry of exclusivityErrors)
                                {
                                    let propertyName = entry[0];
                                    let property: Property = [exclusivity, propertyName];
                                    let propertyDisplayName = propertyName in Errors._exclusivityPropertyDisplayName ? Errors._exclusivityPropertyDisplayName[propertyName] : propertyName.replace(/\B[A-Z]/g, ' $&');
                                    for(let error of entry[1])
                                        this._exclusivityErrors.push(
                                            [
                                                property,
                                                propertyDisplayName,
                                                Errors._errorMap[error]
                                            ]);
                                }
                            }
                        }

                        // Include Facility errors.
                        deal.Confers.filter(
                            commitment => (<any>commitment).$type === 'Web.Model.Facility, Web' && errors.has(commitment))
                            .forEach(
                                commitment =>
                                {
                                    this._facilityErrors = this._facilityErrors || [];
                                    this._facilityErrors.push(
                                        [
                                            [commitment, '$HasErrors'],
                                            null,
                                            null,
                                        ]);
                                });
                    }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get DealErrors(): Error[]
    {
        return this._dealErrors;
    }

    get SponsorErrors(): Error[]
    {
        return this._sponsorErrors;
    }

    get ExclusivityErrors(): Error[]
    {
        return this._exclusivityErrors;
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
