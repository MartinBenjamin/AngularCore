import { Component } from '@angular/core';
import { Tab } from './Gallery/TabbedView';
import { KeyDealData } from './KeyDealData';
import { OriginationTab } from './OriginationTab';
import { MoreTabs } from './MoreTabs';

@Component(
{
    selector: 'body',
    templateUrl: './DealTracker.html'
})
export class DealTracker
{
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
}
