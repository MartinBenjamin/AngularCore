import { Inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { map } from 'rxjs/operators';
import { ClassificationScheme, Classifier } from "../ClassificationScheme";
import { ClassificationSchemeServiceToken } from "../ClassificationSchemeServiceProvider";
import { EmptyGuid, Guid } from "../CommonDomainObjects";
import { ClassificationSchemeIdentifier, Deal, DealRoleIdentifier, Sponsor } from "../Deals";
import { DealLifeCycleServiceToken, IDealLifeCycleService } from '../IDealLifeCycleService';
import { IDomainObjectService } from "../IDomainObjectService";
import { AddIndividual } from '../Ontology/AddIndividuals';
import { EavStore } from '../Ontology/EavStore';
import { AttributeSchema, Cardinality, IEavStore } from '../Ontology/IEavStore';
import { IIndividual } from '../Ontology/IIndividual';
import { IDataPropertyExpression, IObjectPropertyExpression } from '../Ontology/IPropertyExpression';
import { commonDomainObjects } from './CommonDomainObjects';
import { deals } from './Deals';
import { IDealOntology } from "./IDealOntology";

export const DealBuilderToken = new InjectionToken<IDealBuilder>('DealBuilder');

export interface IDealBuilder
{
    Build(dealOntology: IDealOntology, callback: (deal: Deal) => void): void
    Build2(dealOntology: IDealOntology): Deal;
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
        ontology: IDealOntology,
        callback: (deal: Deal) => void
        ): void
    {
        let deal: Deal = {
            Id                : EmptyGuid,
            Name              : null,
            Parties           : [],
            Confers           : [],
            ClassIri          : ontology.Deal.Iri,
            Type              : null,
            Agreements        : [],
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

        Object.defineProperty(
            deal,
            'TotalSponsorEquity',
            {
                get: () =>
                    deal.Parties
                        .filter(party => party.Role.Id === DealRoleIdentifier.Sponsor)
                        .map(party => (<Sponsor>party).Equity)
                        .reduce(
                            (total, currentValue) =>
                            {
                                if(typeof total === 'number' &&
                                    typeof currentValue == 'number' &&
                                    !isNaN(currentValue))
                                    return total + currentValue;

                                return null;
                            },
                            0)
            });

        let dealType: IIndividual = null;
        const classes = ontology.SuperClasses(ontology.Deal);
        for(const class$ of classes)
            if(ontology.IsClassExpression.IObjectHasValue(class$) &&
                class$.ObjectPropertyExpression === deals.Type)
            {
                dealType = class$.Individual;
                break;
            }

        let dealTypeId: string = null;
        for(const dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
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

        let lifeCycle: IIndividual = null;
        for(const class$ of classes)
            if(ontology.IsClassExpression.IObjectHasValue(class$) &&
                class$.ObjectPropertyExpression === deals.LifeCycle)
            {
                lifeCycle = class$.Individual;
                break;
            }

        let lifeCycleId: string = null;
        for(const dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression === commonDomainObjects.Id &&
                dataPropertyAssertion.SourceIndividual === lifeCycle)
            {
                lifeCycleId = dataPropertyAssertion.TargetValue;
                break;
            }

        let notRestrictedId: string = null;
        for(const dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression === commonDomainObjects.Id &&
                dataPropertyAssertion.SourceIndividual === deals.NotRestricted)
            {
                notRestrictedId = dataPropertyAssertion.TargetValue;
                break;
            }

        this._classificationSchemeService
            .Get(ClassificationSchemeIdentifier.Restricted)
            .subscribe(
                classificationScheme =>
                {
                    deal.Classifiers.push(classificationScheme.Classifiers
                        .map(classificationSchemeClassifier => classificationSchemeClassifier.Classifier)
                        .find(classifier => classifier.Id === notRestrictedId));

                    callback(deal);
                });

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
    }

    Build2(
        ontology: IDealOntology
        ): Deal
    {
        let deal: Deal = {
            Name              : null,
            Parties           : [],
            Confers           : [],
            ClassIri          : ontology.Deal.Iri,
            Type              : null,
            Agreements        : [],
            Stage             : null,
            Restricted        : false,
            ProjectName       : null,
            Classifiers       : [],
            GeographicRegion  : null,
            Currency          : null,
            Introducer        : null,
            TransactionDetails: null,
            CurrentStatus     : null,
            SponsorsNA        : false,

        };

        const functionalObjectProperties = new Set<IObjectPropertyExpression>(
            [...ontology.Get(ontology.IsAxiom.IFunctionalObjectProperty)]
                .map(functionalObjectProperty => functionalObjectProperty.ObjectPropertyExpression));
        const functionalDataProperties = new Set<IDataPropertyExpression>(
            [...ontology.Get(ontology.IsAxiom.IFunctionalDataProperty)]
                .map(functionalDataProperty => functionalDataProperty.DataPropertyExpression));
        const keyProperties = new Set<IDataPropertyExpression>(
            [...ontology.Get(ontology.IsAxiom.IHasKey)]
                .filter(hasKey => hasKey.DataPropertyExpressions.length === 1)
                .map(hasKey => hasKey.DataPropertyExpressions[0])
                .filter(keyProperty => functionalDataProperties.has(keyProperty)));

        const attributeSchema: AttributeSchema[] = [];

        for(const keyProperty of keyProperties)
            attributeSchema.push(
                {
                    Name          : keyProperty.LocalName,
                    UniqueIdentity: true,
                    Cardinality   : Cardinality.One
                });

        for(const functionalObjectProperty of functionalObjectProperties)
            attributeSchema.push(
                {
                    Name       : functionalObjectProperty.LocalName,
                    Cardinality: Cardinality.One
                });

        for(const functionalDataProperty of functionalDataProperties)
            if(!keyProperties.has(functionalDataProperty))
                attributeSchema.push(
                    {
                        Name       : functionalDataProperty.LocalName,
                        Cardinality: Cardinality.One
                    });

        for(const objectPropertyExpression of ontology.Get(ontology.IsAxiom.IObjectPropertyExpression))
            if(!functionalObjectProperties.has(objectPropertyExpression))
                attributeSchema.push(
                    {
                        Name       : objectPropertyExpression.LocalName,
                        Cardinality: Cardinality.Many
                    });

        for(const dataPropertyExpression of ontology.Get(ontology.IsAxiom.IDataPropertyExpression))
            if(!functionalDataProperties.has(dataPropertyExpression))
                attributeSchema.push(
                    {
                        Name       : dataPropertyExpression.LocalName,
                        Cardinality: Cardinality.Many
                    });

        const store: IEavStore = new EavStore({ Name: 'Id', UniqueIdentity: true });
        deal = <Deal>store.Add(deal);
        deal.Ontology = ontology;

        store.ObserveAttribute('Equity')
            .pipe(map((sponsorEquity: [any, any][]) =>
                sponsorEquity.length ? sponsorEquity.reduce(
                    (totalSponsorEquity, [, equity]) =>
                    {
                        if(typeof totalSponsorEquity === 'number' &&
                            typeof equity == 'number' &&
                            !isNaN(equity))
                            return totalSponsorEquity + equity;

                        return null;
                    },
                    0) : null
            )).subscribe(totalSponsorEquity => deal.TotalSponsorEquity = totalSponsorEquity);

        let dealType: IIndividual = null;
        let classes = ontology.SuperClasses(ontology.Deal);
        for(const class$ of classes)
            if(ontology.IsClassExpression.IObjectHasValue(class$) &&
                class$.ObjectPropertyExpression === deals.Type)
            {
                dealType = class$.Individual;
                break;
            }

        deal.Type = AddIndividual(
            ontology,
            dealType,
            store);

        this._classificationSchemeService
            .Get(ClassificationSchemeIdentifier.DealType)
            .subscribe(
                classificationScheme => store.Add(classificationScheme.Classifiers
                    .map(classificationSchemeClassifier => classificationSchemeClassifier.Classifier)
                    .find(classifier => classifier.Id === deal.Type.Id)));

        let lifeCycle = null;
        for(const class$ of classes)
            if(ontology.IsClassExpression.IObjectHasValue(class$) &&
                class$.ObjectPropertyExpression === deals.LifeCycle)
            {
                lifeCycle = class$.Individual;
                break;
            }

        let lifeCycleId: string = null;
        for(let dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.DataPropertyExpression === commonDomainObjects.Id &&
                dataPropertyAssertion.SourceIndividual === lifeCycle)
            {
                lifeCycleId = dataPropertyAssertion.TargetValue;
                break;
            }

        deal.Classifiers.push(
            <Classifier>AddIndividual(
                ontology,
                deals.NotRestricted,
                store));

        this._dealLifeCycleService
            .Get(lifeCycleId)
            .subscribe(
                dealLifeCycle =>
                {
                    store.SuspendPublish();
                    deal.Stage     = dealLifeCycle.Stages[0];
                    deal.LifeCycle = dealLifeCycle;
                    store.UnsuspendPublish();
                });
        return deal;
    }
}


export const DealBuilderProvider: Provider =
{
    provide: DealBuilderToken,
    useClass: DealBuilder
};
