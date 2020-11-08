import { Deal } from "../Deals";
import { IDomainObjectBuilder } from "./IDomainObjectBuilder";
import { Guid } from "../CommonDomainObjects";

export interface IDealBuilder extends IDomainObjectBuilder<Guid, Deal>
{
    BankLenderParty(deal: Deal);
    BankAdvisorParty(deal: Deal);
}
