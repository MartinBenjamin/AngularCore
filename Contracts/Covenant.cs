using Parties;
using System;

namespace Contracts
{
    public abstract class Covenant: ContractualCommitment
    {
        public PartyInRole Covenantor { get; protected set; }

        protected Covenant(): base()
        {
        }

        protected Covenant(
            Guid        id,
            Contract    contract,
            PartyInRole covenantor
            ) : base(
                id,
                contract,
                null)
        {
            Covenantor = covenantor;
        }
    }
}
