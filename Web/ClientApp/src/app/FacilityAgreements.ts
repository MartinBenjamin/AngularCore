import { Contract, ContractualCommitment } from "./Contracts";
import { Currency } from "./Iso4217";
import { PartyInRole } from "./Parties";
import { Named, Guid } from "./CommonDomainObjects";
import { percentage } from './Deals';

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
    SameDayFacility          : boolean;
    MultiCurrency            : boolean;
    Bilateral                : boolean;
    Committed                : boolean;
    OnBalanceSheet           : boolean;
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

export interface ExternalFunding extends ContractualCommitment
{
    Percentage: percentage;
}

export interface FeeType extends Named<Guid>
{
}

export interface Expression<T>
{
}

export interface FacilityFee extends ContractualCommitment
{
    Type                : FeeType;
    Amount              : Expression<number>;
    ExpectedReceivedDate: Date;
    Received            : boolean;
    AccrualDate         : Date;
}
