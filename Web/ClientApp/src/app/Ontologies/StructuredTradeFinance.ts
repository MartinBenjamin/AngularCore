import { DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";

export class StructuredTradeFinance
    extends Ontology
    implements IDealOntology
{
    Deal: IClass;

    constructor()
    {
        super(
            "StructuredTradeFinance",
            commonDomainObjects,
            deals);

        let dealType = deals.DealType.DeclareNamedIndividual("StructuredTradeFinance");
        dealType.DataPropertyValue(commonDomainObjects.Id, DealTypeIdentifier.StructuredTradeFinance);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.Define(deals.Class.HasValue(this.Deal.Iri));
        this.Deal.SubClassOf(deals.Debt);
        this.Deal.SubClassOf(deals.Type.HasValue(dealType));
    }
}

export const structuredTradeFinance: IDealOntology = new StructuredTradeFinance();
