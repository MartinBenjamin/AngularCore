import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DealTracker } from '../../DealTracker';
import { Tab } from '../../Gallery/TabbedView';
import { KeyDealData } from '../KeyDealData';
import { MoreTabs } from '../MoreTabs';
import { OriginationTab } from '../OriginationTab';

@Component(
    {
        selector: 'deal',
        templateUrl: './ProjectFinance.html'
    })
export class ProjectFinance implements AfterViewInit
{
    @ViewChild('title')
    private _title: TemplateRef<any>;

    constructor(
        private _dealTracker   : DealTracker,
        private _activatedRoute: ActivatedRoute
        )
    {
        if(typeof this._activatedRoute.snapshot.data.id == 'undefined')
        {
            // Create Project Finance Deal.
        }
        else
        {
        }

    }

    public Tabs =
    [
        new Tab('Key Deal<br/>Data'     , KeyDealData   ),
        new Tab('Transaction<br>Details', OriginationTab),
        new Tab('Security'              , OriginationTab),
        new Tab('Fees &<br/>Income'     , OriginationTab),
        new Tab('Key<br/>Dates'         , OriginationTab),
        new Tab('Key<br/>Counterparties', OriginationTab),
        new Tab('Syndicate<br/>Info'    , OriginationTab),
        new Tab('Key Risks &<br/>Events', OriginationTab),
        new Tab('More'                  , MoreTabs      )
    ];

    ngAfterViewInit()
    {
        setTimeout(() => this._dealTracker.Title = this._title);
    }
}
