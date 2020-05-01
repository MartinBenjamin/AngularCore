import { PartyInRole } from "./Parties";
import { Guid, Named } from "./CommonDomainObjects";

export class DealRoleIdentifier
{
    static readonly Borrower    = '664d48d3-5bb4-46a4-997a-f096b2030808';
    static readonly Lender      = '515cb087-21cf-417e-be1b-229585416015';
    static readonly Guarantor   = '6e4eacfb-27cd-4c83-8ce1-b3bf4043dc37';
    static readonly Advisor     = '32076ce7-7219-48c9-8be1-9e6754b034a6';
    static readonly Sponsor     = '00119e8c-e136-4aa8-a554-db0fcc09850a';
}

export type percentage = number;

export interface Stage extends Named<Guid>
{
}

export interface DealType extends Named<Guid>
{
    Advisory?: boolean;
}

export interface Deal extends Named<Guid>
{
    Type       : DealType;
    Agreements : Agreement[];
    Parties    : DealParty[];
    Commitments: Commitment[];
    Stage      : Stage;
    Restricted : boolean;
    ProjectName: string;
}

export interface DealParty extends PartyInRole
{
    Deal: Deal;
}

export interface Agreement
{
    Deal: Deal;
}

export interface Commitment
{
    Deal: Deal;
}

export interface Sponsor extends DealParty
{
    Equity: percentage;
}
