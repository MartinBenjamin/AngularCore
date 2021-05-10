import { Guid, Named } from "./CommonDomainObjects";
import { Contract, ContractualCommitment } from "./Contracts";
import { percentage } from './Deals';
import { Currency } from "./Iso4217";
import { AccrualDate } from "./AccrualDate";

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

export enum FeeAmountType
{
    MonetaryAmount = 0,
    PercentageOfCommitment
}

export interface FeeAmount
{
    Type : FeeAmountType;
    Value: number;
}

export interface FacilityFee extends ContractualCommitment
{
    Type                : FeeType;
    Amount              : FeeAmount;
    ExpectedReceivedDate: Date;
    Received            : boolean;
    AccrualDate         : AccrualDate;
}
