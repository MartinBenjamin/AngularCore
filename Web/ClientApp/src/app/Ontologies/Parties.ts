import { IClass } from "../Ontology/IClass";
import { IObjectPropertyExpression } from "../Ontology/IPropertyExpression";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";

export class Parties extends Ontology
{
    readonly PartyInRole : IClass;
    readonly Role        : IObjectPropertyExpression;
    readonly Organisation: IObjectPropertyExpression;
    readonly Person      : IObjectPropertyExpression;
    readonly Period      : IObjectPropertyExpression;

    constructor()
    {
        super(
            "Parties",
            commonDomainObjects);

        this.PartyInRole = this.DeclareClass("PartyInRole");
        this.PartyInRole.SubClassOf(commonDomainObjects.DomainObject);

        this.Role         = this.DeclareFunctionalObjectProperty("Role");
        this.Organisation = this.DeclareFunctionalObjectProperty("Organisation");
        this.Person       = this.DeclareFunctionalObjectProperty("Person");
        this.Period       = this.DeclareFunctionalObjectProperty("Period");
    }
}

export const parties = new Parties();
