import { Agreement, Commitment } from "./Agreements";

export interface Contract extends Agreement
{
    Confers       : ContractualCommitment[];
    Mandates     ?: ContractualCommitment[];
    ExecutionDate?: Date;
    EffectiveDate?: Date;
}

export interface ContractualCommitment extends Commitment
{
    ConferredBy?: Contract;
    MandatedBy ?: Contract;
    PartOf     ?: ContractualCommitment;
    Parts      ?: ContractualCommitment[];
}
