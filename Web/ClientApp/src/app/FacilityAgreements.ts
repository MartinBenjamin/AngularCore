import { Classifier } from './ClassificationScheme';
import { Guid, Named } from "./CommonDomainObjects";
import { AccrualDate } from "./Components/AccrualDate";
import { Contract, ContractualCommitment } from "./Contracts";
import { MonetaryAmount } from "./CurrencyAmount";
import { FeeType, QuantityValue } from './Fees';
import { PartyInRole } from './Parties';
import { PartWhole } from './PartWhole';

export interface FacilityAgreement extends Contract
{
}

export interface FacilityType extends Classifier
{
}

export interface Facility extends Named<Guid>, ContractualCommitment, MonetaryAmount
{
    Type                     : FacilityType;
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

export interface ExternalFunding extends ContractualCommitment, QuantityValue
{
}

export interface BookingOffice extends PartyInRole, PartWhole<BookingOffice>
{
}

export { FeeType };

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
