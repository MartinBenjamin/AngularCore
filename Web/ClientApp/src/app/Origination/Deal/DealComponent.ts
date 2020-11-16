import { AfterViewInit, Component, forwardRef, Inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Tab } from '../../Components/TabbedView';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { deals } from '../../Ontologies/Deals';
import { DealBuilderToken, IDealBuilder } from '../../Ontologies/IDealBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { IDealOntologyService } from '../../Ontologies/IDealOntologyService';
import { Validate2 } from '../../Ontologies/Validate';
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
export class DealComponent
    extends DealProvider
    implements AfterViewInit, OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _ontology     : IDealOntology;
    private _errors       : BehaviorSubject<Map<object, object>>;


    @ViewChild('title')
    private _title: TemplateRef<any>;

    public Tabs: Tab[];

    constructor(
        @Inject(DealOntologyServiceToken)
        dealOntologyService    : IDealOntologyService,
        @Inject(DealBuilderToken)
        dealBuilder            : IDealBuilder,
        private _origination   : Origination,
        private _activatedRoute: ActivatedRoute
        )
    {
        super();

        this._subscriptions.push(
            this._activatedRoute.queryParamMap.subscribe(
                params =>
                {
                    this._ontology = dealOntologyService.Get(params.get('originate'));
                    if(!this._ontology)
                        return;

                    let superClasses = this._ontology.SuperClasses(this._ontology.Deal);
                    for(let superClass of superClasses)
                        for(let annotation of superClass.Annotations)
                            if(annotation.Property == deals.ComponentBuildAction &&
                               annotation.Value in this)
                                this[annotation.Value]();

                    if(this._errors)
                        this._errors.complete();

                    this._errors = new BehaviorSubject<Map<object, object>>(null);

                    this._deal.next([dealBuilder.Build(this._ontology), this._errors]);
                }));
    }

    ngAfterViewInit()
    {
        this._origination.Title.next(this._title);
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Deal(): Deal
    {
        return this._deal.getValue()[0];
    }

    Save(): void
    {
        let classifications = this.Deal.Ontology.Classify(this.Deal);
        let errors = Validate2(
            this.Deal.Ontology,
            classifications);

        let transformedErrors = new Map<object, object>();
        for(let individualErrors of errors)
        {
            let transformedPropertyErrors = {};
            transformedErrors.set(
                individualErrors[0],
                transformedPropertyErrors);
            for(let propertyErrors of individualErrors[1])
                transformedPropertyErrors[propertyErrors[0]] = propertyErrors[1];
        }

        this._errors.next(transformedErrors);
    }

    Cancel(): void
    {
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
