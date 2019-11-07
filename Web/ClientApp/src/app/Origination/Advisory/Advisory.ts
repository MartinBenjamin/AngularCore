import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tab } from '../../Gallery/TabbedView';
import { KeyDealData } from '../KeyDealData';
import { Origination } from '../Origination';
import { OriginationTab } from '../OriginationTab';

@Component(
    {
        selector: 'deal',
        templateUrl: './Advisory.html'
    })
export class Advisory implements AfterViewInit
{
    @ViewChild('title')
    private _title: TemplateRef<any>;

    constructor(
        private _origination   : Origination,
        private _activatedRoute: ActivatedRoute
        )
    {
        if(typeof this._activatedRoute.snapshot.data.id == 'undefined')
        {
            // Create Advisory Deal.
        }
        else
        {
        }

    }

    public Tabs =
    [
        new Tab('Key Deal<br/>Data'     , KeyDealData   ),
        new Tab('Fees &<br/>Income'     , OriginationTab),
        new Tab('Key<br/>Dates'         , OriginationTab),
        new Tab('Deal<br/>Team'         , OriginationTab),
        new Tab('Key<br/>Counterparties', OriginationTab)
    ];

    ngAfterViewInit()
    {
        setTimeout(() => this._origination.Title = this._title);
    }
}
