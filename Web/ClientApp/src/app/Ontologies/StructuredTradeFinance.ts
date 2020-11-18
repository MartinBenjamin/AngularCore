import { DealLifeCycleIdentifier, DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";

export class StructuredTradeFinance
    extends Ontology
    implements IDealOntology
{
    Deal            : IClass;
    DealType        : INamedIndividual;
    DealLifeCycleId = DealLifeCycleIdentifier.Debt;

    constructor()
    {
        super(
            "StructuredTradeFinance",
            commonDomainObjects,
            deals);

        this.DealType = deals.DealType.DeclareNamedIndividual("StructuredTradeFinance");
        this.DealType.DataPropertyValue(
            commonDomainObjects.Id,
            DealTypeIdentifier.StructuredTradeFinance);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(deals.Debt);
        this.Deal.SubClassOf(deals.Type.HasValue(this.DealType));
    }
}

export const structuredTradeFinance: IDealOntology = new StructuredTradeFinance();
