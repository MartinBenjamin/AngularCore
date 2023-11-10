import { Inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { map } from 'rxjs/operators';
import { ClassificationScheme, Classifier } from "../ClassificationScheme";
import { ClassificationSchemeServiceToken } from "../ClassificationSchemeServiceProvider";
import { Guid } from "../CommonDomainObjects";
import { ClassificationSchemeIdentifier, Deal } from "../Deals";
import { EavStore } from '../EavStore/EavStore';
import { AttributeSchema, Cardinality, IEavStore } from '../EavStore/IEavStore';
import { DealLifeCycleServiceToken, IDealLifeCycleService } from '../IDealLifeCycleService';
import { IDomainObjectService } from "../IDomainObjectService";
import { AddIndividual } from '../Ontology/AddIndividuals';
import { IIndividual } from '../Ontology/IIndividual';
import { IDataProperty, IObjectProperty } from '../Ontology/IProperty';
import { Thing } from '../Ontology/Thing';
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
            Name              : null,
            Parties           : [],
            Commitments       : [],
            ClassIri          : ontology.Deal.Iri,
            Type              : null,
            Agreements        : [],
            Stage             : null,
            ProjectName       : null,
            Classifiers       : [],
            GeographicRegion  : null,
            Currency          : null,
            Introducer        : null,
            TransactionDetails: null,
            CurrentStatus     : null,
            SponsorsNA        : false
        };

        const functionalObjectProperties = new Set<IObjectProperty>(
            [...ontology.Get(ontology.IsAxiom.IFunctionalObjectProperty)]
                .map(functionalObjectProperty => functionalObjectProperty.ObjectPropertyExpression)
                .filter(ontology.IsAxiom.IObjectProperty));
        const functionalDataProperties = new Set<IDataProperty>(
            [...ontology.Get(ontology.IsAxiom.IFunctionalDataProperty)]
                .map(functionalDataProperty => <IDataProperty>functionalDataProperty.DataPropertyExpression));
        const keyProperties = new Set<IDataProperty>(
            [...ontology.Get(ontology.IsAxiom.IHasKey)]
                .filter(hasKey =>
                    hasKey.ClassExpression                === Thing &&
                    hasKey.DataPropertyExpressions.length === 1)
                .map(hasKey => <IDataProperty>hasKey.DataPropertyExpressions[0])
                .filter(keyProperty => functionalDataProperties.has(keyProperty)));

        const attributeSchema: AttributeSchema[] = [
            {
                Name       : Symbol.toPrimitive,
                Cardinality: Cardinality.One
            }];

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

        for(const objectProperty of ontology.Get(ontology.IsAxiom.IObjectProperty))
            if(!functionalObjectProperties.has(objectProperty))
                attributeSchema.push(
                    {
                        Name       : objectProperty.LocalName,
                        Cardinality: Cardinality.Many
                    });

        for(const dataProperty of ontology.Get(ontology.IsAxiom.IDataProperty))
            if(!functionalDataProperties.has(dataProperty))
                attributeSchema.push(
                    {
                        Name       : dataProperty.LocalName,
                        Cardinality: Cardinality.Many
                    });

        const store: IEavStore = new EavStore(attributeSchema);
        deal = <Deal>store.Assert(deal);
        deal.Ontology = ontology;

        store.Observe('Equity')
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
                classificationScheme => store.Assert(classificationScheme.Classifiers
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
