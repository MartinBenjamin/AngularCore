import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";

export class CommonDomainObjects extends Ontology
{
    DomainObject: IClass;

    constructor()
    {
        super("CommonDomainObjects");

        this.DomainObject = this.DeclareClass("DomainObject");
    }
}
