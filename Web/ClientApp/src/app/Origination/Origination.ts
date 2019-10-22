import { Component, TemplateRef } from '@angular/core';

@Component(
    {
        selector: '',
        templateUrl: './Origination.html'
    })
export class Origination
{
    private _title: TemplateRef<any>

    set Title(
        title: TemplateRef<any>
        )
    {
        this._title = title;
    }

    get Title(): TemplateRef<any>
    {
        return this._title;
    }
}
