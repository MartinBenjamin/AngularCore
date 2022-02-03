import { AfterViewInit, Component, forwardRef, Inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';
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
import { ObserveErrorsSwitchMap } from '../../Ontologies/ObserveErrors';
import { IErrors } from '../../Ontologies/Validate';
import { Store } from '../../Ontology/IEavStore';
import { Origination } from '../Origination';
import { Facility_s } from './Facility_s';
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
    private _errors       : Observable<Map<object, Map<string, Set<keyof IErrors>>>>

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
                        if(this._ontology.IsAxiom.IClass(superClass))
                            for(let annotation of superClass.Annotations)
                                if(annotation.Property == annotations.ComponentBuildAction &&
                                   annotation.Value in this)
                                    this[annotation.Value]();

                    this._deal.next(dealBuilder.Build2(this._ontology));
                    this._errorsService.next(null);
                }));

        this._errors = this.pipe(switchMap(deal =>
        {
            if(!deal)
                return new BehaviorSubject<Map<object, Map<string, Set<keyof IErrors>>>>(null);

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

            return ObserveErrorsSwitchMap(
                deal.Ontology,
                store,
                applicableStages).pipe(map(errors =>
                {
                    deal.Confers.filter(
                        commitment => (<any>commitment).$type === 'Web.Model.Facility, Web')
                        .forEach(
                            commitment =>
                            {
                                for(let object of Facility_s.SubgraphQuery(commitment))
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
                    return errors;

                }));
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

    Save(): void
    {
        this._errors.pipe(takeWhile(errors => errors && errors.size > 0)).subscribe(
            {
                next: errors =>
                {
                    this._errorsService.next(errors);

                    // Detect changes in all Deal Tabs (and nested Tabs).
                    this._changeDetector.DetectChanges();
                },
                complete: () =>
                {
                    this._errorsService.next(null);
                }
            });
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
