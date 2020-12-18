import { Contract, ContractualCommitment } from "./Contracts";
import { Currency } from "./Iso4217";

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
    MultiCurrency            : boolean;
    Committed                : boolean;
}
