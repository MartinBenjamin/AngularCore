import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { Origination } from '../Origination';

@Component(
    {
        selector: 'my-deals',
        templateUrl: './MyDeals.html'
    })
export class MyDeals implements AfterViewInit
{
    @ViewChild('title')
    private _title: TemplateRef<any>;

    constructor(
        private _origination: Origination
        )
    {
    }

    ngAfterViewInit()
    {
        setTimeout(() => this._origination.Title = this._title);
    }
}
