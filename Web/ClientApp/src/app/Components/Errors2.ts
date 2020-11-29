import { Component, Input } from '@angular/core';
import { Path, PathSegment, IErrors } from '../Ontologies/Validate';

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
            GeographicRegion  : 'Country',
            Currency          : 'Base Currency',
            Sponsor           : (party: any) => `${party.Role.Name} (${party.Organisation.Name})`,
            TotalSponsorEquity: 'Total Sponsor Equity'
        }

    private flatten(
        object: any
        )
    {
        if(Array.isArray(object))
        {
            let paths: Path[] = object;
            for(let path of paths)
            {
                let [, errors] = path[path.length - 1];
                (<Set<keyof IErrors>>errors).forEach(error =>
                    this._errors.push(
                        {
                            Error: `${this.MapPath(path)}: ${this._errorMap[error]}.`,
                            Property: errors
                        }));
            }
            return;
        }

        for(var propertyName in object)
            if(Array.isArray(object[propertyName]))
                object[propertyName].forEach(() => this._errors.push(
                    {
                        Error   : `${propertyName}: Mandatory`,
                        Property: object[propertyName]
                    }));

            else
                this.flatten(object[propertyName]);
    };

    @Input()
    set Errors(
        errors: any
        )
    {
        this._errors = null;

        if(!errors)
            return;

        this._errors = [];
        this.flatten(errors);
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
