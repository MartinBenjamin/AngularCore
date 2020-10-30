import { Ontology } from "../Ontology/Ontology";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { roles } from "./Roles";
import { commonDomainObjects } from "./CommonDomainObjects";
import { DealRoleIdentifier } from "../Deals";

export class RoleIndividuals extends Ontology
{

    public Sponsor : INamedIndividual;
    public Borrower: INamedIndividual;
    public Lender  : INamedIndividual;
    public Advisor : INamedIndividual;

    public constructor()
    {
        super(
            "RoleIndividuals",
            commonDomainObjects,
            roles);
        let role = roles.Role;
        let id = commonDomainObjects.Id;
        this.Sponsor  = role.NamedIndividual("Sponsor");
        this.Borrower = role.NamedIndividual("Borrower");
        this.Lender   = role.NamedIndividual("Lender");
        this.Advisor  = role.NamedIndividual("Advisor");
        //this.Sponsor.Value(id, DealRoleIdentifier.Sponsor);
        //this.Borrower.Value(id, DealRoleIdentifier.Borrower);
        //this.Lender.Value(id, DealRoleIdentifier.Lender);
        //this.Advisor.Value(id, DealRoleIdentifier.Advisor);
    }
}
