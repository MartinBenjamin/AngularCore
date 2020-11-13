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
        this.Deal.SubClassOf(deals.SponsoredWhenApplicable);
    }
}

export const leveragedFinance: IDealOntology = new LeveragedFinance();