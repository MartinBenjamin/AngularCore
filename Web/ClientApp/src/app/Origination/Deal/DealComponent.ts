import { AfterViewInit, Component, forwardRef, Inject, InjectionToken, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmptyGuid } from '../../CommonDomainObjects';
import { Tab } from '../../Components/TabbedView';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { KeyCounterparties } from '../KeyCounterparties';
import { KeyDealData } from '../KeyDealData';
import { MoreTabs } from '../MoreTabs';
import { Origination } from '../Origination';
import { OriginationTab } from '../OriginationTab';
import { TransactionDetails } from '../TransactionDetails';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { DealOntologyService } from '../../Ontologies/DealOntologyService';

export let DealOntologyToken = new InjectionToken<IDealOntology>("IDealOntology");

@Component(
    {
        templateUrl: './Deal.html',
        providers:
            [
                {
                    provide: DealProvider,
                    useExisting: forwardRef(() => DealComponent)
                }
            ]
    })
export class DealComponent extends DealProvider implements AfterViewInit
{
    private _subscription: Subscription;

    @ViewChild('title')
    private _title: TemplateRef<any>;

    private _deal: Deal;

    constructor(
        @Inject(DealOntologyToken)
        private _ontology           : IDealOntology,
        @Inject(DealOntologyServiceToken)
        private _dealOntologyService: DealOntologyService,
        private _origination        : Origination,
        private _activatedRoute     : ActivatedRoute
        )
    {
        super();
        //this._subscription = this._behaviourSubject.subscribe(deal => this._deal = deal)
        //alert(this._ontology.Deal.Iri);
        //alert(this._activatedRoute.snapshot.params.Ontology);
        this._ontology = _dealOntologyService.Get(this._activatedRoute.snapshot.params.Ontology);
        alert(this._ontology.Deal.Iri);

        if(typeof this._activatedRoute.snapshot.data.id == 'undefined')
        {
            // Create Project Finance Deal.
            // Need to get stages.
            // Need to set up MUFG Bank, Ltd. as Lender.
            this._behaviourSubject.next(<Deal>{
                Id         : EmptyGuid,
                Name       : null,
                Agreements : [],
                Commitments: [],
                Parties    : [],
                Restricted : false,
                ProjectName: null,
                Classifiers: []
            });
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
        setTimeout(() => this._origination.Title = this._title);
    }
}
