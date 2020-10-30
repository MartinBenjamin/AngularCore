import { IClass } from "../Ontology/IClass";
import { IObjectPropertyExpression } from "../Ontology/IPropertyExpression";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";

export class Parties extends Ontology
{

    PartyInRole : IClass;
    Role        : IObjectPropertyExpression;
    Organisation: IObjectPropertyExpression;
    Person      : IObjectPropertyExpression;

    constructor()
    {
        super(
            "Parties",
            commonDomainObjects);

        this.PartyInRole = this.DeclareClass("PartyInRole");
        this.PartyInRole.SubClassOf(commonDomainObjects.DomainObject);

        this.Role         = this.PartyInRole.DeclareObjectProperty("Role");
        this.Organisation = this.PartyInRole.DeclareObjectProperty("Organisation");
        this.Person       = this.PartyInRole.DeclareObjectProperty("Person");
    }
}

export let parties = new Parties();
