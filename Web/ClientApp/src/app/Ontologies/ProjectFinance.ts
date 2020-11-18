import { DealLifeCycleIdentifier, DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";

export class ProjectFinance
    extends Ontology
    implements IDealOntology
{
    Deal            : IClass;
    DealType        : INamedIndividual;
    DealLifeCycleId = DealLifeCycleIdentifier.Debt;

    constructor()
    {
        super(
            "ProjectFinance",
            commonDomainObjects,
            deals);

        this.DealType = deals.DealType.DeclareNamedIndividual("ProjectFinance");
        this.DealType.DataPropertyValue(
            commonDomainObjects.Id,
            DealTypeIdentifier.ProjectFinance);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(deals.Debt);
        this.Deal.SubClassOf(deals.Type.HasValue(this.DealType));
        this.Deal.SubClassOf(deals.Sponsored);
    }
}

export const projectFinance: IDealOntology = new ProjectFinance();
