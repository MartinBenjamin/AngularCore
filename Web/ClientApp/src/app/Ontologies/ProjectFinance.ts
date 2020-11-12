import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";
import { DealTypeIdentifier } from "../Deals";

export class ProjectFinance
    extends Ontology
    implements IDealOntology
{
    Deal    : IClass;
    DealType: INamedIndividual;

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
        this.Deal.SubClassOf(deals.Parties.MinCardinality(1, deals.SponsorParty))
            .Annotate(
                deals.RestrictedfromStage,
                0)
            .Annotate(
                deals.SubPropertyName,
                "Sponsors");
        //this.Deal.SubClassOf(deals.Sponsors.MinCardinality(1))
        //    .Annotate(
        //        deals.RestrictedfromStage,
        //        0);
    }
}

export const projectFinance: IDealOntology = new ProjectFinance();
