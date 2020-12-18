import { Agreement, Commitment } from "./Agreements";

export interface Contract extends Agreement
{
}

export interface ContractualCommitment extends Commitment
{
    Contract?: Contract;
    PartOf  ?: ContractualCommitment;
    Parts   ?: ContractualCommitment[];
}
