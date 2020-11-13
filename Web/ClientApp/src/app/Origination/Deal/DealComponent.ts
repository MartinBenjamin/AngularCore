import { AfterViewInit, Component, forwardRef, Inject, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tab } from '../../Components/TabbedView';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { DealOntologyService } from '../../Ontologies/DealOntologyService';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { deals } from '../../Ontologies/Deals';
import { DealBuilderToken, IDealBuilder } from '../../Ontologies/IDealBuilder';
import { DealComponentBuilder } from '../../Ontologies/IDealComponentBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { KeyCounterparties } from '../KeyCounterparties';
import { KeyDealData } from '../KeyDealData';
import { MoreTabs } from '../MoreTabs';
import { Origination } from '../Origination';
import { OriginationTab } from '../OriginationTab';
import { TransactionDetails } from '../TransactionDetails';

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
    private _ontology: IDealOntology;

    @ViewChild('title')
    private _title: TemplateRef<any>;

    public Tabs: Tab[];

    constructor(
        @Inject(DealOntologyServiceToken)
        private _dealOntologyService: DealOntologyService,
        @Inject(DealBuilderToken)
        dealBuilder                 : IDealBuilder,
        private _origination        : Origination,
        private _activatedRoute     : ActivatedRoute
        )
    {
        super();

        this._activatedRoute.queryParamMap.subscribe(
            params =>
            {
                this._ontology = _dealOntologyService.Get(params.get('originate'));
                if(!this._ontology)
                    return;

                let superClasses = this._ontology.SuperClasses(this._ontology.Deal);
                for(let superClass of superClasses)
                    for(let annotation of superClass.Annotations)
                        if(annotation.Property == deals.ComponentBuildAction &&
                           annotation.Value in this)
                            this[annotation.Value]();

                this._behaviourSubject.next(dealBuilder.Build(this._ontology));
            });
    }

    ngAfterViewInit()
    {
        this._origination.Title.next(this._title);
    }

    get Deal(): Deal
    {
        return this._behaviourSubject.getValue();
    }

    AddAdvisoryTabs()
    {
        this.Tabs =
            [
                new Tab('Key Deal<br/>Data'     , KeyDealData      ),
                new Tab('Fees &<br/>Income'     , OriginationTab   ),
                new Tab('Key<br/>Dates'         , OriginationTab   ),
                new Tab('Deal<br/>Team'         , OriginationTab   ),
                new Tab('Key<br/>Counterparties', KeyCounterparties)
            ];
    }

    AddDebtTabs()
    {
        this.Tabs =
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
    }
}
