using Agreements;
using System;
using System.Collections.Generic;

namespace Contracts
{
    public abstract class Covenant: ContractualCommitment
    {
        public AgreementParty Covenantor { get; protected set; }

        protected Covenant(): base()
        {
        }

        protected Covenant(
            Guid           id,
            Contract       contract,
            AgreementParty covenantor
            ) : base(
                id,
                contract,
                null,
                new List<AgreementParty> { covenantor })
        {
            Covenantor = covenantor;
        }
    }
}
