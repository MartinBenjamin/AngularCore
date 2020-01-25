using Agreements;
using System;
using System.Collections.Generic;

namespace Contracts
{
    // Terms and conditions that define the commitment made by the contracting parties,
    // such as rights and obligations when a contract is awarded or entered into.
    public abstract class ContractualCommitment: ContractualElement
    {
        public virtual ContractualCommitment        PartOf   { get; protected set; }
        // Parties that are bound legally or by agreement to repay a debt, make a payment, do something, or refrain from doing something.
        public virtual IList<AgreementParty>        Obligors { get; protected set; }
        public virtual IList<ContractualCommitment> Parts    { get; protected set; }

        protected ContractualCommitment() : base()
        {
        }

        protected ContractualCommitment(
            Guid                  id,
            Contract              contract,
            ContractualCommitment partOf,
            IList<AgreementParty> obligors
            ) : base(
                id,
                contract)
        {
            PartOf   = partOf;
            Obligors = obligors;
            PartOf?.Parts.Add(this);
        }
    }
}
