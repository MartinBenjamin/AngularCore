import { Component, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component(
    {
        selector: '',
        templateUrl: './AssetManagement.html'
    })
export class AssetManagement
{
    private readonly _title = new BehaviorSubject<TemplateRef<any>>(null);

    get Title(): BehaviorSubject<TemplateRef<any>>
    {
        return this._title;
    }
}
