import { Component, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component(
    {
        selector: '',
        templateUrl: './Origination.html'
    })
export class Origination
{
    private readonly _title = new BehaviorSubject<TemplateRef<any>>(null);

    get Title(): BehaviorSubject<TemplateRef<any>>
    {
        return this._title;
    }
}
