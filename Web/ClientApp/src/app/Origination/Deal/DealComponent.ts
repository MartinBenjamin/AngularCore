import { AfterViewInit, Component, forwardRef, Inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Guid } from '../../CommonDomainObjects';
import { Tab } from '../../Components/TabbedView';
import { DealProvider } from '../../DealProvider';
import { Deal, DealRoleIdentifier } from '../../Deals';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { deals } from '../../Ontologies/Deals';
import { DealBuilderToken, IDealBuilder } from '../../Ontologies/IDealBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { IDealOntologyService } from '../../Ontologies/IDealOntologyService';
import { IErrors, Path, Validate } from '../../Ontologies/Validate';
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
    private _errors       : BehaviorSubject<Map<object, Map<string, Set<keyof IErrors>>>>;
    private _dealErrors   : object;

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

                    this._errors = new BehaviorSubject<Map<object, Map<string, Set<keyof IErrors>>>>(null);
                    this._dealErrors = null;

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

    get Errors(): any
    {
        return this._dealErrors;
    }

    Save(): void
    {
        let classifications = this.Deal.Ontology.Classify(this.Deal);
        let applicableStages = new Set<Guid>();
        for(let lifeCycleStage of this.Deal.LifeCycle.Stages)
        {
            applicableStages.add(lifeCycleStage.Id);
            if(lifeCycleStage.Id === this.Deal.Stage.Id)
                break;
        }

        let errors = Validate(
            this.Deal.Ontology,
            classifications,
            applicableStages);

        this._errors.next(errors);

        let errorPaths: Path[] = [];

        let dealErrors = errors.get(this.Deal);
        if(dealErrors)
            for(let entry of dealErrors)
                errorPaths.push([entry]);

        // Include Sponsor errors.
        for(let sponsor of this.Deal.Parties.filter(party => party.Role.Id === DealRoleIdentifier.Sponsor))
        {
            let sponsorErrors = errors.get(sponsor);
            if(sponsorErrors)
                for(let entry of sponsorErrors)
                    errorPaths.push([["Sponsor", sponsor], entry]);
        }

        this._dealErrors = errorPaths;
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
