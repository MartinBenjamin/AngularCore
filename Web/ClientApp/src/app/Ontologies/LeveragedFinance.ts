import { DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";

export class LeveragedFinance
    extends Ontology
    implements IDealOntology
{
    Deal: IClass;

    constructor()
    {
        super(
            "LeveragedFinance",
            commonDomainObjects,
            deals);

        let dealType = deals.DealType.DeclareNamedIndividual("LeveragedFinance");
        dealType.DataPropertyValue(commonDomainObjects.Id, DealTypeIdentifier.LeveragedFinance);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.Define(deals.Class.HasValue(this.Deal.Iri));
        this.Deal.SubClassOf(deals.Debt);
        this.Deal.SubClassOf(deals.Type.HasValue(dealType));
        this.Deal.SubClassOf(deals.SponsoredWhenApplicable);
    }
}

export const leveragedFinance: IDealOntology = new LeveragedFinance();
