import { DealTypeIdentifier } from "../Deals";
import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { deals } from "./Deals";
import { IDealOntology } from "./IDealOntology";

export class ProjectFinance
    extends Ontology
    implements IDealOntology
{
    Deal: IClass;

    constructor()
    {
        super(
            "ProjectFinance",
            commonDomainObjects,
            deals);

        let dealType = deals.DealType.DeclareNamedIndividual("ProjectFinance");
        dealType.DataPropertyValue(commonDomainObjects.Id, DealTypeIdentifier.ProjectFinance);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(deals.Debt);
        this.Deal.SubClassOf(deals.Type.HasValue(dealType));
        this.Deal.SubClassOf(deals.Sponsored);
    }
}

export const projectFinance: IDealOntology = new ProjectFinance();
