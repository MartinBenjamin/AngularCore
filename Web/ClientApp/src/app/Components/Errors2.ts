import { Component, Inject, Input } from '@angular/core';
import { Subject } from "rxjs";
import { IErrors, Path, PathSegment } from '../Ontologies/Validate';
import { HighlighterServiceToken } from './ModelErrors';

@Component(
    {
        selector: 'errors',
        template: '\
<ul>\
    <li *ngFor="let error of _errors" [innerHTML]="error.Message" (click)="Highlight(error.Errors)" style="cursor: pointer;"></li>\
</ul>'
    })
export class Errors2
{
    public _errors: any[];    
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
        @Inject(HighlighterServiceToken)
        private _highlighterService: Subject<object>
        )
    {
    }

    @Input()
    set Errors(
        errorPaths: Path[]
        )
    {
        this._errors = null;

        if(!errorPaths)
            return;

        this._errors = [];
        for(let errorPath of errorPaths)
        {
            let [, errors] = errorPath[errorPath.length - 1];
            (<Set<keyof IErrors>>errors).forEach(error =>
                this._errors.push(
                    {
                        Message: `${this.MapPath(errorPath)}: ${this._errorMap[error]}.`,
                        Errors : errors
                    }));
        }

        this._highlighterService.next(null);
    }

    Highlight(
        errors: object
        ): void
    {
        this._highlighterService.next(errors);
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
