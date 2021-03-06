import { Component, Inject, Input } from '@angular/core';
import { Subject } from "rxjs";
import { IErrors, Path, PathSegment, ErrorPath } from '../../Ontologies/Validate';
import { HighlighterServiceToken } from '../../Components/ModelErrors';
import { HighlightedPropertySubjectToken, Property } from '../../Components/ValidatedProperty';

@Component(
    {
        selector: 'errors',
        template: '\
<ul>\
    <li *ngFor="let error of Errors" [innerHTML]="error.Message" (click)="Highlight(error.Property)" style="cursor: pointer;"></li>\
</ul>'
    })
export class Errors
{
    private _errors  : any[];    
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
        @Inject(HighlightedPropertySubjectToken)
        private _highlightedPropertyService: Subject<Property>
        )
    {
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
