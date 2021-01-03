import { Contract, ContractualCommitment } from "./Contracts";
import { Currency } from "./Iso4217";
import { PartyInRole } from "./Parties";

export interface FacilityAgreement extends Contract
{

}

export interface Facility extends ContractualCommitment
{
    Name                     : string;
    Currency                 : Currency;
    TotalCommitments         : number;
    AvailabilityPeriodEndDate: Date;
    MaturityDate             : Date;
    Expected1StDrawdownDate  : Date;
    MultiCurrency            : boolean;
    Committed                : boolean;
}

export interface LenderParticipation extends ContractualCommitment
{
    Lender               : PartyInRole;
    Amount               : number;
    UnderwriteAmount     : number;
    CreditSoughtLimit    : number;
    AnticipatedHoldAmount: number;
    ActualAllocation     : number;
}
