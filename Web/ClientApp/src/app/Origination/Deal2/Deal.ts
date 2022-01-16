import { AfterViewInit, Component, forwardRef, Inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Guid } from '../../CommonDomainObjects';
import { ChangeDetector, Tab } from '../../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { annotations } from '../../Ontologies/Annotations';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { DealBuilderToken, IDealBuilder } from '../../Ontologies/IDealBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { IDealOntologyService } from '../../Ontologies/IDealOntologyService';
import { ObserveErrors } from '../../Ontologies/ObserveErrors';
import { IErrors, Validate } from '../../Ontologies/Validate';
import { Store } from '../../Ontology/IEavStore';
import { Alternative, Empty, Property, Query2, Sequence, ZeroOrMore } from '../../RegularPathExpression';
import { Origination } from '../Origination';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { TransactionDetails } from './TransactionDetails';

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

    @ViewChild('title', { static: true })
    private _title: TemplateRef<any>;

    public Tabs: Tab[];

    public static FacilitySubgraphQuery = Query2(new Sequence(
        [
            new ZeroOrMore(new Property('Parts')),
            new Alternative(
                [
                    Empty,
                    new Property('Amount'),
                    new Property('AccrualDate')
                ])
        ]));

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
                        if(this._ontology.IsAxiom.IClass(superClass))
                            for(let annotation of superClass.Annotations)
                                if(annotation.Property == annotations.ComponentBuildAction &&
                                   annotation.Value in this)
                                    this[annotation.Value]();

                    this._deal.next(dealBuilder.Build2(this._ontology));
                    this._errorsService.next(null);
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

    Save(): void
    {
        let applicableStages = new Set<Guid>();
        for(let lifeCycleStage of this.Deal.LifeCycle.Stages)
        {
            applicableStages.add(lifeCycleStage.Id);
            if(lifeCycleStage.Id === this.Deal.Stage.Id)
                break;
        }

        const store = Store(this.Deal);
        if(store)
        {
            const errorsObservable: Observable<Map<object, Map<string, Set<keyof IErrors>>>> = ObserveErrors(
                this.Deal.Ontology,
                store,
                applicableStages);

            const subscription = errorsObservable.subscribe(
                errors =>
                {
                    this.Deal.Confers.filter(
                        commitment => (<any>commitment).$type === 'Web.Model.Facility, Web')
                        .forEach(
                            commitment =>
                            {
                                for(let object of Deal.FacilitySubgraphQuery(commitment))
                                    if(errors.has(object))
                                    {
                                        let facilityErrors = errors.get(commitment);
                                        if(!facilityErrors)
                                        {
                                            facilityErrors = new Map<string, Set<keyof IErrors>>();
                                            errors.set(
                                                commitment,
                                                facilityErrors);
                                        }

                                        let hasErrors = facilityErrors.get('$HasErrors');
                                        if(!hasErrors)
                                            facilityErrors.set(
                                                '$HasErrors',
                                                new Set<keyof IErrors>());
                                        break;
                                    }
                            });

                    this._errorsService.next(errors.size ? errors : null);
                });

            return;
        }

        let classifications = this.Deal.Ontology.Classify(this.Deal);
        let errors = Validate(
            this.Deal.Ontology,
            classifications,
            applicableStages);

        this.Deal.Confers.filter(
            commitment => (<any>commitment).$type === 'Web.Model.Facility, Web')
            .forEach(
                commitment =>
                {
                    for(let object of Deal.FacilitySubgraphQuery(commitment))
                        if(errors.has(object))
                        {
                            let facilityErrors = errors.get(commitment);
                            if(!facilityErrors)
                            {
                                facilityErrors = new Map<string, Set<keyof IErrors>>();
                                errors.set(
                                    commitment,
                                    facilityErrors);
                            }

                            let hasErrors = facilityErrors.get('$HasErrors');
                            if(!hasErrors)
                                facilityErrors.set(
                                    '$HasErrors',
                                    new Set<keyof IErrors>());
                            break;
                        }
                });

        this._errorsService.next(errors.size ? errors : null);

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
