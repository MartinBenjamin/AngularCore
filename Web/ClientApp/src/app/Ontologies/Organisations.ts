import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";

export class Organisations extends Ontology
{
    readonly Organisation: IClass

    public constructor()
    {
        super("Organisations", commonDomainObjects);
        this.Organisation = this.DeclareClass("Organisation");
        this.Organisation.SubClassOf(commonDomainObjects.Named);
    }
}

export let organisations = new Organisations();
