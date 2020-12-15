import { DomainObject, Guid } from "./CommonDomainObjects";
import { PartyInRole } from "./Parties";

export interface Agreement extends DomainObject<Guid>
{
    Title  : string;
    Parties: PartyInRole[];
    Confers: Commitment[];
}

export interface Commitment extends DomainObject<Guid>
{
}
