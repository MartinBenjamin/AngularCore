import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from "rxjs";
import { ErrorsObservableToken, HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { Deal, DealRoleIdentifier } from '../../Deals';
import { ErrorPath, IErrors, Path, PathSegment } from '../../Ontologies/Validate';

@Component(
    {
        selector: 'errors',
        template: `
<div *ngIf="Errors" style="color: red;">
  Save was unsuccessful.  Please fix the errors and try again.
  <ul>
    <li *ngFor="let error of Errors" [innerHTML]="error.Message" (click)="Highlight(error.Property)" style="cursor: pointer;"></li>
  </ul>
</div>`
    })
export class Errors implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _errors       : any[];    
    private _errorMap: IErrors =
        {
            Mandatory       : "Mandatory",
            Invalid         : "Invalid",
            MustBe100Percent: "Must be 100%"
        };
    private _pathSegmentMap =
        {
            GeographicRegion  : "Country",
            Currency          : "Base Currency",
            EndDate           : "Date",
            PartyInRole       : (partyInRole: any) => `${partyInRole.Role.Name} [${partyInRole.Organisation.Name}]`
        }

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
                        let deal  : Deal;
                        let errors: Map<object, Map<string, Set<keyof IErrors>>>;
                        [deal, errors] = combined;

                        this._errors = null;
                        if(!(deal && errors))
                            return;

                        let errorPaths: ErrorPath[] = [];

                        let dealErrors = errors.get(deal);
                        if(dealErrors)
                            for(let entry of dealErrors)
                                errorPaths.push([deal, [entry]]);

                        // Include Sponsor errors.
                        for(let sponsor of deal.Parties.filter(party => party.Role.Id === DealRoleIdentifier.Sponsor))
                        {
                            let sponsorErrors = errors.get(sponsor);
                            if(sponsorErrors)
                                for(let entry of sponsorErrors)
                                    errorPaths.push([deal, [["PartyInRole", sponsor], entry]]);
                        }

                        // Include Exclusivity errors.
                        let exclusivity = deal.Confers.find(commitment => (<any>commitment).$type == 'Web.Model.Exclusivity, Web');
                        if(exclusivity)
                        {
                            let exclusivityErrors = errors.get(exclusivity);
                            if(exclusivityErrors)
                                for(let entry of exclusivityErrors)
                                    errorPaths.push([deal, [["Exclusivity", exclusivity], entry]]);
                        }

                        this.Paths = errorPaths.length ? errorPaths : null;
                    }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    @Input()
    set Paths(
        errorPaths: ErrorPath[]
        )
    {
        this._errors = null;

        if(!errorPaths)
            return;

        this._errors = [];
        for(let errorPath of errorPaths)
        {
            let [, path] = errorPath;
            let [, errors] = path[path.length - 1];
            (<Set<keyof IErrors>>errors).forEach(error =>
                this._errors.push(
                    {
                        Message : `${this.MapPath(path)}: ${this._errorMap[error]}.`,
                        Property:
                            [
                                path.length === 1 ? errorPath[0] : path[path.length - 2][1],
                                path[path.length - 1][0]
                            ]
                    }));
        }

        this._highlightedPropertyService.next(null);
    }

    get Errors(): any[]
    {
        return this._errors;
    }

    Highlight(
        property: Property
        ): void
    {
        this._highlightedPropertyService.next(property);
    }

    private MapPath(
        path: Path
        )
    {
        return path.map(pathSegment => this.MapPathSegment(pathSegment)).join(' ');
    }

    private MapPathSegment(
        [propertyName, object]: PathSegment
        ): string
    {
        let mapType = typeof this._pathSegmentMap[propertyName];
        if(mapType === 'string')
            return this._pathSegmentMap[propertyName];

        else if(mapType === 'function')
            return this._pathSegmentMap[propertyName](object);

        return propertyName.replace(/\B[A-Z]/g, ' $&'); 
    }
}
