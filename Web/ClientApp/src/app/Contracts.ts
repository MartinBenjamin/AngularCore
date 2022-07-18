import { Agreement, Commitment } from "./Agreements";
import { PartWhole } from './PartWhole';

export interface Contract extends Agreement
{
    Confers       : ContractualCommitment[];
    Mandates     ?: ContractualCommitment[];
    ExecutionDate?: Date;
    EffectiveDate?: Date;
}

export interface ContractualCommitment extends Commitment, PartWhole<ContractualCommitment>
{
    ConferredBy?: Contract;
    MandatedBy ?: Contract;
}
