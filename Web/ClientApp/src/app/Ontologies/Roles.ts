import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";

export class Roles extends Ontology
{
    readonly Role: IClass;

    constructor()
    {
        super(
            "Roles",
            commonDomainObjects)

        this.Role = this.DeclareClass("Role");
        this.Role.SubClassOf(commonDomainObjects.Named);
    }
}

export let roles = new Roles();
