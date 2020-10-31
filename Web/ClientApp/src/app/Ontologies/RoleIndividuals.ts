import { DealRoleIdentifier } from "../Deals";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { roles } from "./Roles";

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
        this.Sponsor  = role.DeclareNamedIndividual("Sponsor" );
        this.Borrower = role.DeclareNamedIndividual("Borrower");
        this.Lender   = role.DeclareNamedIndividual("Lender"  );
        this.Advisor  = role.DeclareNamedIndividual("Advisor" );
        this.Sponsor.DataPropertyValue(id, DealRoleIdentifier.Sponsor);
        this.Borrower.DataPropertyValue(id, DealRoleIdentifier.Borrower);
        this.Lender.DataPropertyValue(id, DealRoleIdentifier.Lender);
        this.Advisor.DataPropertyValue(id, DealRoleIdentifier.Advisor);
    }
}
