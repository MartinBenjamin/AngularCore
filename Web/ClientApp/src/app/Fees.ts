import { Classifier } from './ClassificationScheme';
import { AccrualDate } from './Components/AccrualDate';
import { ContractualCommitment } from './Contracts';

export interface FeeType extends Classifier
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
