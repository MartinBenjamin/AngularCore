import { Component, Input } from '@angular/core';

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

    private flatten(
        object: any
        )
    {
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
}
