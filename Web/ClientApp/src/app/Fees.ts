import { ContractualCommitment } from './Contracts';
import { AccrualDate } from './Components/AccrualDate';
import { Named, Guid } from './CommonDomainObjects';

export interface FeeType extends Named<Guid>
{
}

export interface QuantityValue
{
    MeasurementUnit?: any;
    NumericValue    : number;
}

export interface Fee extends QuantityValue, ContractualCommitment
{
    Type                : FeeType;
    ExpectedReceivedDate: Date;
    Received            : boolean;
    AccrualDate         : AccrualDate;
}

export enum FacilityFeeUnit
{
    CommitmentCurrency = 0,
    Percentage
}
