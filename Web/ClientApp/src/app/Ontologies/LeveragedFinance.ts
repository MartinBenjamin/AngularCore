import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";
import { DealTypeIdentifier } from "../Deals";
import { IDataPropertyExpression } from "../Ontology/IPropertyExpression";
import { DataHasValue } from "../Ontology/DataHasValue";

export class LeveragedFinance
    extends Ontology
    implements IDealOntology
{
    Deal    : IClass;
    DealType: INamedIndividual;

    SponsoredWhenApplicable: IClass;
    Sponsored              : IClass;
    SponsorsNA             : IDataPropertyExpression

    constructor()
    {
        super(
            "LeveragedFinance",
            commonDomainObjects,
            deals);

        this.DealType = deals.DealType.DeclareNamedIndividual("LeveragedFinance");
        this.DealType.DataPropertyValue(
            commonDomainObjects.Id,
            DealTypeIdentifier.LeveragedFinance);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(deals.Debt);
        this.Deal.SubClassOf(deals.Type.HasValue(this.DealType));

        this.SponsoredWhenApplicable = this.DeclareClass("SponsoredWhenApplicable");
        this.SponsorsNA = this.Deal.DeclareDataProperty("SponsorsNA");
        this.Sponsored = this.DeclareClass("Sponsored");
        this.Sponsored.Define(new DataHasValue(this.SponsorsNA, true));
        this.Sponsored.SubClassOf(this.Deal);

        this.Deal.SubClassOf(deals.Sponsored)
            .Annotate(
                deals.RestrictedfromStage,
                0)
            .Annotate(
                deals.SubPropertyName,
                "Sponsors");
    }
}

export const leveragedFinance: IDealOntology = new LeveragedFinance();
