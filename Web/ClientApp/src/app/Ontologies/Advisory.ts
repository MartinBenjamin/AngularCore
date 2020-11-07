import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";
import { DealTypeIdentifier } from "../Deals";

export class Advisory
    extends Ontology
    implements IDealOntology
{
    Deal    : IClass;
    DealType: INamedIndividual;

    constructor()
    {
        super(
            "Advisory",
            commonDomainObjects,
            deals);

        this.DealType = deals.DealType.DeclareNamedIndividual("Advisory");
        this.DealType.DataPropertyValue(
            commonDomainObjects.Id,
            DealTypeIdentifier.Advisory);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(deals.Debt);
        this.Deal.SubClassOf(deals.Type.HasValue(this.DealType));
        this.Deal.SubClassOf(deals.Sponsors.MaxCardinality(0));
    }
}

export let advisory = new Advisory();