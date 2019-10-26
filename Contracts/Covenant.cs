using System;

namespace Contracts
{
    public abstract class Covenant: ContractualCommitment
    {
        protected Covenant(
            Guid     id,
            Contract contract
            ) : base(
                id,
                contract)
        {
        }
    }
}
