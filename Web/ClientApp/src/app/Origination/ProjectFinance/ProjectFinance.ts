import { AfterViewInit, Component, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tab } from '../../Gallery/TabbedView';
import { KeyDealData } from '../KeyDealData';
import { MoreTabs } from '../MoreTabs';
import { Origination } from '../Origination';
import { OriginationTab } from '../OriginationTab';
import { TransactionDetails } from '../TransactionDetails';
import { Deal } from '../../Deals';
import { EmptyGuid } from '../../CommonDomainObjects';
import { DealProvider } from '../../DealProvider';

@Component(
    {
        templateUrl: './ProjectFinance.html',
        providers:
            [
                {
                    provide: DealProvider,
                    useExisting: forwardRef(() => ProjectFinance)
                }
            ]
    })
export class ProjectFinance extends DealProvider implements AfterViewInit
{
    @ViewChild('title')
    private _title: TemplateRef<any>;

    private _deal: Deal;

    constructor(
        private _origination   : Origination,
        private _activatedRoute: ActivatedRoute
        )
    {
        super();

        if(typeof this._activatedRoute.snapshot.data.id == 'undefined')
        {
            // Create Project Finance Deal.
            // Need to get stages.
            // Need to set up MUFG Bank, Ltd. as Lender.
            this._deal = <Deal>{
                Id         : EmptyGuid,
                Name       : null,
                Agreements : [],
                Commitments: [],
                Parties    : [],
                Restricted : false,
                ProjectName: null
            };
        }
        else
        {
        }
    }

    get Deal(): Deal
    {
        return this._deal;
    }

    public Tabs =
    [
        new Tab('Key Deal<br/>Data'     , KeyDealData       ),
        new Tab('Transaction<br>Details', TransactionDetails),
        new Tab('Security'              , OriginationTab    ),
        new Tab('Fees &<br/>Income'     , OriginationTab    ),
        new Tab('Key<br/>Dates'         , OriginationTab    ),
        new Tab('Deal<br/>Team'         , OriginationTab    ),
        new Tab('Key<br/>Counterparties', OriginationTab    ),
        new Tab('Syndicate<br/>Info'    , OriginationTab    ),
        new Tab('Key Risks &<br/>Events', OriginationTab    ),
        new Tab('More'                  , MoreTabs          )
    ];

    ngAfterViewInit()
    {
        setTimeout(() => this._origination.Title = this._title);
    }
}
