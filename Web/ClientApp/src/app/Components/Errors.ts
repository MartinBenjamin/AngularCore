import { Component, Inject, Input } from '@angular/core';
import { Subject } from "rxjs";
import { HighlighterServiceToken } from './ModelErrors';

@Component(
    {
        selector: 'dt-errors',
        template: '\
<ul>\
    <li *ngFor="let error of _errors" [innerHTML]="error.Error" (click)="Highlight(error.Property)" style="cursor: pointer;"></li>\
</ul>'
    })
export class Errors
{
    public _errors: any[];

    constructor(
        @Inject(HighlighterServiceToken)
        private _highlighterService: Subject<object>
        )
    {
    }

    private flatten(
        object: any
        )
    {
        for(var propertyName in object)
            if(Array.isArray(object[propertyName]))
                object[propertyName].forEach((error: string) => this._errors.push(
                    {
                        Error   : error,
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
        errors: object
        ): void
    {
        this._highlighterService.next(errors);
    }
}
