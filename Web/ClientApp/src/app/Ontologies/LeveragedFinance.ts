import { DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { IDataPropertyExpression } from "../Ontology/IPropertyExpression";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";

export class LeveragedFinance
    extends Ontology
    implements IDealOntology
{
    Deal              : IClass;
    DealType          : INamedIndividual;
    SponsorsApplicable: IClass;
    SponsorsNA        : IDataPropertyExpression

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

        this.SponsorsNA = this.Deal.DeclareDataProperty("SponsorsNA");
        this.SponsorsApplicable = this.DeclareClass("SponsorsApplicable");
        this.SponsorsApplicable.Define(this.SponsorsNA.HasValue(false));
        this.SponsorsApplicable.SubClassOf(deals.Sponsored)
            .Annotate(
                deals.RestrictedfromStage,
                0)
            .Annotate(
                deals.SubPropertyName,
                "Sponsors");

        this.Deal.Annotate(deals.ComponentBuildAction, "AddSponsors"  );
        this.Deal.Annotate(deals.ComponentBuildAction, "AddSponsorsNA")
    }
}

export const leveragedFinance: IDealOntology = new LeveragedFinance();
