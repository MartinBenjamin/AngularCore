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
import { DealComponentBuilder, IDealComponentBuilder } from '../../Ontologies/IDealComponentBuilder';
import { IDealOntology } from '../../Ontologies/IDealOntology';
import { Origination } from '../Origination';

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
        @Inject(DealBuilderToken)
        dealBuilder                 : IDealBuilder,
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

                this._behaviourSubject.next(dealBuilder.Build(this._ontology));
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
