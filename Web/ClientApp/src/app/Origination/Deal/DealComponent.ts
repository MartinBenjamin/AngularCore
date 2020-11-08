import { AfterViewInit, Component, forwardRef, Inject, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmptyGuid } from '../../CommonDomainObjects';
import { Tab } from '../../Components/TabbedView';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { DealOntologyService } from '../../Ontologies/DealOntologyService';
import { DealOntologyServiceToken } from '../../Ontologies/DealOntologyServiceProvider';
import { DealComponentBuilder } from '../../Ontologies/IDealComponentBuilder';
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

        new DealComponentBuilder().BuildDebtTabs(this);

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

    ngAfterViewInit()
    {
        setTimeout(() => this._origination.Title = this._title);
    }
}
