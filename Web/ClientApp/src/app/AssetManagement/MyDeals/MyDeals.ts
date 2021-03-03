import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { AssetManagement } from '../AssetManagement';

@Component(
    {
        selector: 'my-deals',
        templateUrl: './MyDeals.html'
    })
export class MyDeals implements AfterViewInit
{
    @ViewChild('title', { static: true })
    private _title: TemplateRef<any>;

    constructor(
        private _assetManagement: AssetManagement
        )
    {
    }

    ngAfterViewInit()
    {
        setTimeout(() => this._assetManagement.Title.next(this._title));
    }
}
