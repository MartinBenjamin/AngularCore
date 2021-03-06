import { AfterViewInit, Component, forwardRef, Inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Guid } from '../../CommonDomainObjects';
import { ChangeDetector, Tab } from '../../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { DealRoleIdentifier } from '../../Deals';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { deals } from '../../Ontologies/Deals';
import { DealBuilderToken, IDealBuilder } from '../../Ontologies/IDealBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { IDealOntologyService } from '../../Ontologies/IDealOntologyService';
import { ErrorPath, IErrors, Validate } from '../../Ontologies/Validate';
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
                    useExisting: forwardRef(() => Deal)
                },
                ErrorsSubjectProvider,
                ErrorsObservableProvider,
                HighlightedPropertySubjectProvider,
                HighlightedPropertyObservableProvider
            ]
    })
export class Deal
    extends DealProvider
    implements AfterViewInit, OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _ontology     : IDealOntology;
    private _errorPaths   : ErrorPath[];

    @ViewChild('title', { static: true })
    private _title: TemplateRef<any>;

    public Tabs: Tab[];

    constructor(
        @Inject(DealOntologyServiceToken)
        dealOntologyService    : IDealOntologyService,
        @Inject(DealBuilderToken)
        dealBuilder            : IDealBuilder,
        @Inject(ErrorsSubjectToken)
        private _errorsService : Subject<Errors>,
        private _origination   : Origination,
        private _activatedRoute: ActivatedRoute,
        private _changeDetector: ChangeDetector
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

                    this._errorPaths = null;
                    this._deal.next(dealBuilder.Build(this._ontology));
                }));
    }

    ngAfterViewInit()
    {
        setTimeout(() => this._origination.Title.next(this._title));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Deal(): import('../../Deals').Deal
    {
        return this._deal.getValue();
    }

    get Errors(): ErrorPath[]
    {
        return this._errorPaths;
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

        this._errorsService.next(errors);

        let errorPaths: ErrorPath[] = [];

        let dealErrors = errors.get(this.Deal);
        if(dealErrors)
            for(let entry of dealErrors)
                errorPaths.push([this.Deal, [entry]]);

        // Include Sponsor errors.
        for(let sponsor of this.Deal.Parties.filter(party => party.Role.Id === DealRoleIdentifier.Sponsor))
        {
            let sponsorErrors = errors.get(sponsor);
            if(sponsorErrors)
                for(let entry of sponsorErrors)
                    errorPaths.push([this.Deal, [["PartyInRole", sponsor], entry]]);
        }

        // Include Exclusivity errors.
        let exclusivity = this.Deal.Confers.find(commitment => (<any>commitment).$type == 'Web.Model.Exclusivity, Web');
        if(exclusivity)
        {
            let exclusivityErrors = errors.get(exclusivity);
            if(exclusivityErrors)
                for(let entry of exclusivityErrors)
                    errorPaths.push([this.Deal, [["Exclusivity", exclusivity], entry]]);
        }

        this._errorPaths = errorPaths.length ? errorPaths : null;

        // Detect changes in all Deal Tabs (and nested Tabs).
        this._changeDetector.DetectChanges();
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
