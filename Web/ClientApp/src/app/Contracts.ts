import { Agreement, Commitment } from "./Agreements";

export interface Contract extends Agreement
{
    Mandates     ?: ContractualCommitment[];
    ExecutionDate?: Date;
    EffectiveDate?: Date;
}

export interface ContractualCommitment extends Commitment
{
    MandatedBy?: Contract;
    PartOf    ?: ContractualCommitment;
    Parts     ?: ContractualCommitment[];
}
