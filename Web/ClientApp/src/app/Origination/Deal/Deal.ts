import { AfterViewInit, Component, forwardRef, Inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, NEVER, Subject, Subscription } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { Guid } from '../../CommonDomainObjects';
import { ChangeDetector, Tab } from '../../Components/TabbedView';
import { Errors, ErrorsObservableProvider, ErrorsSubjectProvider, ErrorsSubjectToken, HighlightedPropertyObservableProvider, HighlightedPropertySubjectProvider } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { LifeCycle, LifeCycleStage } from '../../LifeCycles';
import { annotations } from '../../Ontologies/Annotations';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { DealBuilderToken, IDealBuilder } from '../../Ontologies/IDealBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { IDealOntologyService } from '../../Ontologies/IDealOntologyService';
import { Error, ObserveErrors } from '../../Ontologies/ObserveErrors';
import { Store } from '../../Ontology/IEavStore';
import { Origination } from '../Origination';
import { Facility } from './Facility';
import { FeesTab } from './FeesTab';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { TransactionDetails } from './TransactionDetails';
import { KeyDates } from './KeyDates';

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

        this._errors = this._deal.pipe(switchMap(
            deal =>
            {
                if(!deal)
                    return NEVER;

                const store = Store(deal);
                const applicableStages = store.Observe(
                    ['?Stage', '?LifeCycle'],
                    [deal, 'Stage', '?Stage'], [deal, 'LifeCycle', '?LifeCycle']).pipe(map(
                        (result: [LifeCycleStage, LifeCycle][]) =>
                        {
                            const applicableStages = new Set<Guid>();

                            if(result.length)
                            {
                                const [stage, lifeCycle] = result[0]
                                for(let lifeCycleStage of lifeCycle.Stages)
                                {
                                    applicableStages.add(lifeCycleStage.Id);
                                    if(lifeCycleStage.Id === stage.Id)
                                        break;
                                }
                            }

                            return applicableStages;
                        }));

                return ObserveErrors(
                    deal.Ontology,
                    store,
                    applicableStages);
            }), shareReplay(1));

        const errors = this._observeErrors.pipe(switchMap(
            observeErrors =>
            {
                if(!observeErrors)
                    return NEVER;

                return combineLatest(
                    this._errors,
                    this._deal,
                    (errors, deal) =>
                    {
                        deal.Commitments.filter(
                            commitment => (<any>commitment).$type === 'Web.Model.Facility, Web')
                            .forEach(
                                commitment =>
                                {
                                    for(let object of Facility.SubgraphQuery(commitment))
                                        if(errors.has(object))
                                        {
                                            let facilityErrors = errors.get(commitment);
                                            if(!facilityErrors)
                                            {
                                                facilityErrors = new Map<string, Set<Error>>();
                                                errors.set(
                                                    commitment,
                                                    facilityErrors);
                                            }

                                            let hasErrors = facilityErrors.get('$HasErrors');
                                            if(!hasErrors)
                                                facilityErrors.set(
                                                    '$HasErrors',
                                                    new Set<Error>());
                                            break;
                                        }
                                });
                        return errors;
                    });
            }));

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

                    this._observeErrors.next(false);
                    this._deal.next(dealBuilder.Build(this._ontology));
                    this._errorsService.next(null);
                }),
            errors.subscribe(
                errors =>
                {
                    this._errorsService.next(errors.size ? errors : null);

                    // Detect changes in all Deal Tabs (and nested Tabs).
                    this._changeDetector.DetectChanges();
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
        this._observeErrors.next(true);
    }

    Cancel(): void
    {
    }

    AddAdvisoryTabs()
    {
        this.Tabs =
            [
                new Tab('Key Deal<br/>Data'     , KeyDealData      ),
                new Tab('Fees &<br/>Income'     , FeesTab          ),
                new Tab('Key<br/>Dates'         , KeyDates         ),
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
                new Tab('Fees &<br/>Income'     , FeesTab           ),
                new Tab('Key<br/>Dates'         , KeyDates          ),
                new Tab('Deal<br/>Team'         , OriginationTab    ),
                new Tab('Key<br/>Counterparties', KeyCounterparties ),
                new Tab('Syndicate<br/>Info'    , OriginationTab    ),
                new Tab('Key Risks &<br/>Events', OriginationTab    ),
                new Tab('More'                  , MoreTabs          )
            ];
    }
}
