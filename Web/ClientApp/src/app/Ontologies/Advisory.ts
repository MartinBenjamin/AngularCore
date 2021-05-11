import { DealLifeCycleIdentifier, DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";
import { lifeCycles } from "./LifeCycles";
import { annotations } from './Annotations';

export class Advisory
    extends Ontology
    implements IDealOntology
{
    Deal: IClass;

    constructor()
    {
        super(
            "Advisory",
            commonDomainObjects,
            lifeCycles,
            annotations,
            deals);

        let dealType = deals.DealType.DeclareNamedIndividual("Advisory");
        dealType.DataPropertyValue(commonDomainObjects.Id, DealTypeIdentifier.Advisory);

        let lifeCycle = lifeCycles.LifeCycle.DeclareNamedIndividual("AdvisoryLifeCycle");
        lifeCycle.DataPropertyValue(commonDomainObjects.Id, DealLifeCycleIdentifier.Advisory);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(deals.Deal);
        this.Deal.SubClassOf(deals.Type.HasValue(dealType));
        this.Deal.SubClassOf(deals.LifeCycle.HasValue(lifeCycle));
        this.Deal.SubClassOf(deals.Sponsored);
        this.Deal.Annotate(annotations.ComponentBuildAction, "AddAdvisoryTabs");
    }
}

export const advisory: IDealOntology = new Advisory();
