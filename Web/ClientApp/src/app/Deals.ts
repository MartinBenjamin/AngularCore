import { Classifier } from "./ClassificationScheme";
import { Guid, Named } from "./CommonDomainObjects";
import { GeographicRegion } from "./Locations";
import { IDealOntology } from "./Ontologies/IDealOntology";
import { PartyInRole } from "./Parties";

export class DealRoleIdentifier
{
    static readonly Borrower    = '664d48d3-5bb4-46a4-997a-f096b2030808';
    static readonly Lender      = '515cb087-21cf-417e-be1b-229585416015';
    static readonly Guarantor   = '6e4eacfb-27cd-4c83-8ce1-b3bf4043dc37';
    static readonly Advisor     = '32076ce7-7219-48c9-8be1-9e6754b034a6';
    static readonly Sponsor     = '00119e8c-e136-4aa8-a554-db0fcc09850a';
}

export class DealTypeIdentifier
{
    static readonly Advisory               = 'db033bfe-091e-481c-a5c3-abd2c1eda302';
    static readonly ProjectFinance         = 'db1b30e1-435b-414f-bff0-1e17954144f7';
    static readonly Aviation               = '1bc5767a-3e01-4e19-b12e-0d1adb6465e9';
    static readonly LeveragedFinance       = '89388279-d127-4e7a-b7e0-e6b96c19a340';
    static readonly Corporate              = '23ac45d7-ddee-44c4-aa91-aeae00d82867';
    static readonly Shipping               = 'd2eddbfc-5e6c-4ca1-9274-e15e2d70497d';
    static readonly ECA                    = '09ee6467-9253-41f6-9f9d-7ba33ec503ae';
    static readonly StructuredTradeFinance = '42dce82e-2be8-40bf-8ec6-628150e654d9';
    static readonly CommodityFinance       = 'e051f245-385b-4587-9af1-0354308ccbbc';
    static readonly Securitisation         = '7f132ed7-d8f0-4443-9cee-cbe10acdcdea';
}

export class ClassificationSchemeIdentifier
{
    static readonly DealType    = 'e28b89e1-97e4-4820-aabc-af31e6959888';
    static readonly Exclusivity = 'f7c20b62-ffe8-4c20-86b4-e5c68ba2469d';
}

export class ExclusivityClassifierIdentifier
{
    static readonly Yes = '846a9c20-2971-47ab-bc2d-6e6ed6ef137d';
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
    ClassIri        : string;
    Type            : DealType;
    Agreements      : Agreement[];
    Parties         : DealParty[];
    Commitments     : Commitment[];
    Stage           : Stage;
    Restricted      : boolean;
    ProjectName     : string;
    Classifiers     : Classifier[];
    GeographicRegion: GeographicRegion;
    SponsorsNA      : boolean;
    Ontology?       : IDealOntology;
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
