import { DomainObject, Guid, Named } from "./CommonDomainObjects";
import { PartyInRole } from "./Parties";

export interface Agreement extends Named<Guid>
{
    Parties: PartyInRole[];
    Confers: Commitment[];
}

export interface Commitment extends DomainObject<Guid>
{
    Obligors?: PartyInRole[]
}
