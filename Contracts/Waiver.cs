using CommonDomainObjects;
using System;

namespace Contracts
{
    public class Waiver: DomainObject<Guid>
    {
        public Contract Contract { get; protected set; }

        protected Waiver() : base()
        {
        }

        protected Waiver(
            Guid     id,
            Contract contract
            ) : base(id)
        {
            Contract = contract;
        }
    }
}
