using Agreements;
using System;
using System.Collections.Generic;

namespace Contracts
{
    public abstract class ContractualCommitment: ContractualElement
    {
        public IList<AgreementParty> Parties { get; protected set; }

        protected ContractualCommitment() : base()
        {
        }

        protected ContractualCommitment(
            Guid     id,
            Contract contract
            ) : base(
                id,
                contract)
        {
        }
    }
}
