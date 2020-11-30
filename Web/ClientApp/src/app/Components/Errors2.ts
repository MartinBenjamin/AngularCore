import { Component, Input } from '@angular/core';
import { IErrors, Path, PathSegment } from '../Ontologies/Validate';

@Component(
    {
        selector: 'errors',
        template: '\
<ul>\
    <li *ngFor="let error of _errors" [innerHTML]="error.Error" (click)="Highlight(error.Property)" style="cursor: pointer;"></li>\
</ul>'
    })
export class Errors2
{
    private _errors: any[];    
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
            Sponsor           : (party: any) => `${party.Role.Name} [${party.Organisation.Name}]`,
            TotalSponsorEquity: "Total Sponsor Equity"
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
                        Error: `${this.MapPath(errorPath)}: ${this._errorMap[error]}.`,
                        Property: errors
                    }));
        }

        this._errors.forEach(error => error.Property.Highlight = 0);
    }

    Highlight(
        property: any
        ): void
    {
        this._errors.forEach((error: any) => error.Property.Highlight = (error.Property == property ? error.Property.Highlight + 1 : 0));
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

        return propertyName; 
    }
}
