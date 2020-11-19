import { Inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { ClassificationScheme } from "../ClassificationScheme";
import { ClassificationSchemeServiceToken } from "../ClassificationSchemeServiceProvider";
import { EmptyGuid, Guid } from "../CommonDomainObjects";
import { ClassificationSchemeIdentifier, Deal } from "../Deals";
import { DealLifeCycleServiceToken, IDealLifeCycleService } from '../IDealLifeCycleService';
import { IDomainObjectService } from "../IDomainObjectService";
import { commonDomainObjects } from './CommonDomainObjects';
import { deals } from './Deals';
import { IDealOntology } from "./IDealOntology";

export const DealBuilderToken = new InjectionToken<IDealBuilder>('DealBuilder');

export interface IDealBuilder
{
    Build(dealOntology: IDealOntology): Deal;
}

@Injectable()
export class DealBuilder implements IDealBuilder
{
    constructor(
        @Inject(ClassificationSchemeServiceToken)
        private _classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>,
        @Inject(DealLifeCycleServiceToken)
        private _dealLifeCycleService: IDealLifeCycleService
        )
    {
    }

    Build(
        ontology: IDealOntology
        ): Deal
    {
        let deal: Deal = {
            Id                : EmptyGuid,
            Name              : null,
            ClassIri          : ontology.Deal.Iri,
            Type              : null,
            Agreements        : [],
            Commitments       : [],
            Parties           : [],
            Stage             : null,
            Restricted        : false,
            ProjectName       : null,
            Classifiers       : [],
            GeographicRegion  : null,
            Currency          : null,
            Introducer        : null,
            TransactionDetails: null,
            CurrentStatus     : null,
            SponsorsNA        : false
        };

        Object.defineProperty(
            deal,
            'Ontology',
            { get: () => ontology });

        let dealType = null;
        let classes = ontology.SuperClasses(ontology.Deal);
        for(let class$ of classes)
            for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
                if(subClassOf.SubClassExpression === class$)
                {
                    let superClassExpression = subClassOf.SuperClassExpression;
                    if(ontology.IsClassExpression.IObjectHasValue(superClassExpression) &&
                       superClassExpression.ObjectPropertyExpression === deals.Type)
                    {
                        dealType = superClassExpression.Individual;
                        break;
                    }

                }

        let dealTypeId: string = null;
        for(let dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression === commonDomainObjects.Id &&
               dataPropertyAssertion.SourceIndividual === dealType)
            {
                dealTypeId = dataPropertyAssertion.TargetValue;
                break;
            }

        this._classificationSchemeService
            .Get(ClassificationSchemeIdentifier.DealType)
            .subscribe(
                classificationScheme => deal.Type = classificationScheme.Classifiers
                    .map(classificationSchemeClassifier => classificationSchemeClassifier.Classifier)
                    .find(classifier => classifier.Id === dealTypeId));

        let lifeCycle = null;
        for(let class$ of classes)
            for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
                if(subClassOf.SubClassExpression === class$)
                {
                    let superClassExpression = subClassOf.SuperClassExpression;
                    if(ontology.IsClassExpression.IObjectHasValue(superClassExpression) &&
                        superClassExpression.ObjectPropertyExpression === deals.LifeCycle)
                    {
                        lifeCycle = superClassExpression.Individual;
                        break;
                    }

                }

        let lifeCycleId: string = null;
        for(let dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression === commonDomainObjects.Id &&
                dataPropertyAssertion.SourceIndividual === lifeCycle)
            {
                lifeCycleId = dataPropertyAssertion.TargetValue;
                break;
            }

        this._dealLifeCycleService
            .Get(lifeCycleId)
            .subscribe(
                dealLifeCycle =>
                {
                    deal.Stage = dealLifeCycle.Stages[0];
                    Object.defineProperty(
                        deal,
                        'LifeCycle',
                        { get: () => dealLifeCycle });
                });
        return deal;
    }
}

export const DealBuilderProvider: Provider =
{
    provide: DealBuilderToken,
    useClass: DealBuilder
};
