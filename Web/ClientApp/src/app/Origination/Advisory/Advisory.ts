import { AfterViewInit, Component, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tab } from '../../Components/TabbedView';
import { KeyDealData } from '../KeyDealData';
import { Origination } from '../Origination';
import { OriginationTab } from '../OriginationTab';
import { DealProvider } from '../../DealProvider';
import { EmptyGuid } from '../../CommonDomainObjects';
import { Deal } from '../../Deals';

@Component(
    {
        templateUrl: './Advisory.html',
        providers:
            [
                {
                    provide: DealProvider,
                    useExisting: forwardRef(() => Advisory)
                }
            ]
    })
export class Advisory extends DealProvider implements AfterViewInit
{
    @ViewChild('title', { static: true })
    private _title: TemplateRef<any>;

    constructor(
        private _origination   : Origination,
        private _activatedRoute: ActivatedRoute
        )
    {
         super();
        //this._subscription = this._deal.subscribe(deal => this._deal = deal)

        if(typeof this._activatedRoute.snapshot.data.id == 'undefined')
        {
            // Create Advisory Deal.
            // Need to get stages.
            // Need to set up MUFG Bank, Ltd. as Advisor.
            this._deal.next(
                [
                    <Deal>{
                        Id         : EmptyGuid,
                        Name       : null,
                        Parties    : [],
                        Confers    : [],
                        Agreements : [],
                        Restricted : false,
                        ProjectName: null,
                        Classifiers: []
                    },
                    null
                ]);
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
        this._origination.Title.next(this._title);
    }
}
