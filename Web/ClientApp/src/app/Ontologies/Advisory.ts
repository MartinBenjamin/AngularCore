import { DealLifeCycleIdentifier, DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";
import { lifeCycles } from "./LifeCycles";

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
            deals);

        let dealType = deals.DealType.DeclareNamedIndividual("Advisory");
        dealType.DataPropertyValue(commonDomainObjects.Id, DealTypeIdentifier.Advisory);

        let lifeCycle = lifeCycles.LifeCycle.DeclareNamedIndividual("DebtLifeCycle");
        lifeCycle.DataPropertyValue(commonDomainObjects.Id, DealLifeCycleIdentifier.Advisory);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(deals.Deal);
        this.Deal.SubClassOf(deals.Type.HasValue(dealType));
        this.Deal.SubClassOf(deals.LifeCycle.HasValue(lifeCycle));
        this.Deal.SubClassOf(deals.Sponsored);
        this.Deal.Annotate(deals.ComponentBuildAction, "AddAdvisoryTabs");
    }
}

export const advisory: IDealOntology = new Advisory();
