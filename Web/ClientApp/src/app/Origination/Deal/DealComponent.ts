import { AfterViewInit, Component, forwardRef, Inject, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmptyGuid, Guid } from '../../CommonDomainObjects';
import { Tab } from '../../Components/TabbedView';
import { DealProvider } from '../../DealProvider';
import { Deal, ClassificationSchemeIdentifier } from '../../Deals';
import { DealOntologyService } from '../../Ontologies/DealOntologyService';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { DealComponentBuilder, IDealComponentBuilder } from '../../Ontologies/IDealComponentBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { Origination } from '../Origination';
import { deals } from '../../Ontologies/Deals';
import { IDomainObjectService } from '../../IDomainObjectService';
import { ClassificationScheme } from '../../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../../ClassificationSchemeServiceProvider';
import { commonDomainObjects } from '../../Ontologies/CommonDomainObjects';

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
    private _ontology    : IDealOntology;
    private _deal        : Deal;

    @ViewChild('title')
    private _title: TemplateRef<any>;

    public Tabs: Tab[];

    constructor(
        @Inject(DealOntologyServiceToken)
        private _dealOntologyService: DealOntologyService,
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService : IDomainObjectService<Guid, ClassificationScheme>,
        private _origination        : Origination,
        private _activatedRoute     : ActivatedRoute
        )
    {
        super();

        let dealComponentBuilder = new DealComponentBuilder();
        this._activatedRoute.queryParamMap.subscribe(
            params =>
            {
                this._ontology = _dealOntologyService.Get(params.get('originate'));
                if(!this._ontology)
                    return;

                let superClasses = this._ontology.SuperClasses(this._ontology.Deal);
                for(let superClass of superClasses)
                    for(let annotation of superClass.Annotations)
                        if(annotation.Property == deals.ComponentBuildAction)
                            dealComponentBuilder[<keyof IDealComponentBuilder>annotation.Value](this);

                let dealTypeId: string = null;
                for(let dataPropertyAssertion of this._ontology.Get(this._ontology.IsAxiom.IDataPropertyAssertion))
                    if(dataPropertyAssertion.DataPropertyExpression === commonDomainObjects.Id &&
                        dataPropertyAssertion.SourceIndividual === this._ontology.DealType)
                    {
                        dealTypeId = dataPropertyAssertion.TargetValue;
                        break;
                    }

                classificationSchemeService
                    .Get(ClassificationSchemeIdentifier.DealType)
                    .subscribe(
                        classificationScheme =>
                        {
                            for(let classificationSchemeClassifier of classificationScheme.Classifiers)
                                if(classificationSchemeClassifier.Classifier.Id === dealTypeId)
                                    this._behaviourSubject.next(<Deal>{
                                        Id         : EmptyGuid,
                                        Type       : classificationSchemeClassifier.Classifier,
                                        Name       : null,
                                        Agreements : [],
                                        Commitments: [],
                                        Parties    : [],
                                        Restricted : false,
                                        ProjectName: null,
                                        Classifiers: []
                                    });
                        });

            });
        //this._subscription = this._behaviourSubject.subscribe(deal => this._deal = deal)
    }

    ngAfterViewInit()
    {
        this._origination.Title.next(this._title);
    }

    get Deal(): Deal
    {
        return this._behaviourSubject.getValue();
    }
}
