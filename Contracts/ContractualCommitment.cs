using Agreements;
using System;
using System.Collections.Generic;

namespace Contracts
{
    // Terms and conditions that define the commitment made by the contracting parties,
    // such as rights and obligations when a contract is awarded or entered into.
    public abstract class ContractualCommitment: Commitment
    {
        public virtual Contract                     Contract { get; protected set; }
        public virtual ContractualCommitment        PartOf   { get; protected set; }
        public virtual IList<ContractualCommitment> Parts    { get; protected set; }

        protected ContractualCommitment() : base()
        {
        }

        protected ContractualCommitment(
            Guid                  id,
            Contract              contract,
            ContractualCommitment partOf
            ) : base(id)
        {
            Contract = contract;
            PartOf   = partOf;
            PartOf?.Parts.Add(this);
        }
    }
}
