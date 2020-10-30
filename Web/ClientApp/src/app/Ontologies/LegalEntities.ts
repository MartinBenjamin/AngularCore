import { Ontology } from "../Ontology/Ontology";
import { IClass } from "../Ontology/IClass";
import { organisations } from "./Organisations";

export class LegalEntities extends Ontology
{
    LegalEntity: IClass;

    public constructor()
    {
        super("LegalEntities", organisations);
        this.LegalEntity = this.DeclareClass("LegalEntity");
        this.LegalEntity.SubClassOf(organisations.Organisation);
    }
}

export let legalEntities = new LegalEntities();
