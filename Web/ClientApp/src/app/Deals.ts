import { Agreement, Commitment } from "./Agreements";
import { Classifier } from "./ClassificationScheme";
import { Guid, Named } from "./CommonDomainObjects";
import { ContractualCommitment } from "./Contracts";
import { Currency } from "./Iso4217";
import { LifeCycle, LifeCycleStage } from "./LifeCycles";
import { GeographicRegion } from "./Locations";
import { IDealOntology } from "./Ontologies/IDealOntology";
import { PartyInRole } from "./Parties";

export class DealRoleIdentifier
{
    static readonly Borrower                = '664d48d3-5bb4-46a4-997a-f096b2030808';
    static readonly Lender                  = '515cb087-21cf-417e-be1b-229585416015';
    static readonly Guarantor               = '6e4eacfb-27cd-4c83-8ce1-b3bf4043dc37';
    static readonly Advisor                 = '32076ce7-7219-48c9-8be1-9e6754b034a6';
    static readonly Sponsor                 = '00119e8c-e136-4aa8-a554-db0fcc09850a';
    static readonly BookingOffice           = 'c16b1702-4c42-4f68-8100-ffdf83df3626';
    static readonly ExternalFundingProvider = '3d89680f-93b3-493e-b3ea-e8ee3926c164';
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
    static readonly Restricted  = '10414c1c-da0c-44f0-be02-7f70fe1b8649';
}

export class ExclusivityClassifierIdentifier
{
    static readonly Yes = '846a9c20-2971-47ab-bc2d-6e6ed6ef137d';
}

export class DealLifeCycleIdentifier
{
    static readonly Debt     = 'f8f4136c-0a82-4191-b01b-e0184a2d86bb';
    static readonly Advisory = 'a72c74af-3724-45c3-94f0-8d2c49d110d1';
}

export class DealLifeCyclePhaseIdentifier
{
    static readonly Origination = '7a08488a-40b9-41c8-ba72-96daadccca25';
    static readonly Portfolio   = '312c009f-f13b-420b-8d16-17154ad1e859';
}

export class RestrictedClassifierIdentifier
{
    static readonly No  = '13c8dc1d-e611-4694-9107-c625a868359c';
    static readonly Yes = '5cd2b680-cb36-49e1-8d3d-62ada643a389';
}

export class DealStageIdentifier
{
    static readonly OriginationPhase        = '7a08488a-40b9-41c8-ba72-96daadccca25';
    static readonly PortfolioPhase          = '312c009f-f13b-420b-8d16-17154ad1e859';
    static readonly Prospect                = 'dc99f690-352e-4b9c-86e6-2a5d69a2446c';
    static readonly BusinessScreened        = '803cc380-d5d9-46b0-af8e-04d725c40492';
    static readonly SubmittedToCredit       = '29f43eee-cb63-4a3b-9fab-e0dc46ee191b';
    static readonly CreditApproved          = '544d253e-b126-4a26-bbde-4ea3abd57eaa';
    static readonly Mandated                = '8a93ae15-45e5-4e13-860c-c5e78cd055e5';
    static readonly Signed                  = 'ad4aa809-92d1-4926-a0ba-80353650ea0b';
    static readonly FinancialClose          = '052adecb-8ebc-44e0-a813-c270ab6819b2';
    static readonly OnHold                  = '00f62dcb-f084-4bd9-ae7c-2207c38befc9';
    static readonly Lost                    = 'e1755070-eecd-4ab5-9306-f20824ab2143';
    static readonly Declined                = 'c5656736-84db-45a8-9bf7-a41e8d975e89';
    static readonly Handover                = '3796cc25-8b2f-4db2-b2d0-251743e0d0d0';
    static readonly Portfolio               = '5c37e0ab-a3ac-483f-b916-34afd4409c08';
    static readonly RepaidPrepaid           = '049fd845-3c52-4c3c-919e-1ab23b5f90fa';
    static readonly ProposalSubmitted       = 'c67e176f-09cd-459e-9b3c-ba3924ae69a3';
    static readonly MandatedBidSubmitted    = '428aecea-a47e-4e43-8db6-3f728020139d';
    static readonly MandatedPreferredBidder = '1abce8b1-8e09-42a2-a62c-a83b57eca902';
    static readonly MandateSuspended        = '58384555-077b-4521-8a4f-871475dc3530';
}

export type percentage = number;

export interface DealType extends Classifier
{
}

export interface Deal extends Named<Guid>
{
    Parties            : PartyInRole[];
    Commitments        : Commitment[];
    ClassIri           : string;
    Type               : DealType;
    Agreements         : Agreement[];
    Stage              : LifeCycleStage;
    ProjectName        : string;
    Classifiers        : Classifier[];
    GeographicRegion   : GeographicRegion;
    Currency           : Currency;
    Introducer         : string;
    SponsorsNA         : boolean;
    TransactionDetails : string;
    TotalSponsorEquity?: number;
    CurrentStatus      : string;
    Ontology?          : IDealOntology;
    LifeCycle?         : LifeCycle;
}

export interface Sponsor extends PartyInRole
{
    Equity: percentage;
}

export interface Exclusivity extends ContractualCommitment
{
    EndDate: Date
}
