import { AfterViewInit, Component, forwardRef, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmptyGuid } from '../../CommonDomainObjects';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { Tab } from '../../Components/TabbedView';
import { KeyCounterparties } from '../KeyCounterparties';
import { KeyDealData } from '../KeyDealData';
import { MoreTabs } from '../MoreTabs';
import { Origination } from '../Origination';
import { OriginationTab } from '../OriginationTab';
import { TransactionDetails } from '../TransactionDetails';

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
    private _subscription: Subscription;

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
            // Create Project Finance Deal.
            // Need to get stages.
            // Need to set up MUFG Bank, Ltd. as Lender.
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
        new Tab('Key Deal<br/>Data'     , KeyDealData       ),
        new Tab('Transaction<br>Details', TransactionDetails),
        new Tab('Security'              , OriginationTab    ),
        new Tab('Fees &<br/>Income'     , OriginationTab    ),
        new Tab('Key<br/>Dates'         , OriginationTab    ),
        new Tab('Deal<br/>Team'         , OriginationTab    ),
        new Tab('Key<br/>Counterparties', KeyCounterparties ),
        new Tab('Syndicate<br/>Info'    , OriginationTab    ),
        new Tab('Key Risks &<br/>Events', OriginationTab    ),
        new Tab('More'                  , MoreTabs          )
    ];

    ngAfterViewInit()
    {
        this._origination.Title.next(this._title);
    }
}
