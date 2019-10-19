import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { DealTracker } from '../../DealTracker';

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
        private _dealTracker: DealTracker
        )
    {
    }

    ngAfterViewInit()
    {
        setTimeout(()=>this._dealTracker.Title = this._title);
    }
}
